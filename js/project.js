angular.module('openeis-ui.project', [
    'ngResource',
    'angularFileUpload',
    'openeis-ui.api',
    'openeis-ui.auth-route',
    'openeis-ui.directives',
    'openeis-ui.file-upload',
    'openeis-ui.filters',
    'openeis-ui.modals',
    'openeis-ui.projects.projects-service',
    'openeis-ui.sensor-container',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/projects/:projectId', {
            controller: 'ProjectCtrl',
            templateUrl: 'partials/project.html',
            resolve: {
                project: ['Projects', '$route', function(Projects, $route) {
                    return Projects.get($route.current.params.projectId);
                }],
                dataFiles: ['Files', '$route', function(Files, $route) {
                    return Files.query($route.current.params.projectId);
                }],
                dataSets: ['DataSets', '$route', function(DataSets, $route) {
                    return DataSets.query($route.current.params.projectId).$promise;
                }],
                dataMaps: ['DataMaps', '$route', function(DataMaps, $route) {
                    return DataMaps.query($route.current.params.projectId).$promise;
                }],
            },
        });
})
.controller('ProjectCtrl', function ($scope, project, dataFiles, Files, dataSets, DataSets, dataMaps, $upload, $timeout, $q, Modals, DataReports) {
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = dataSets;
    $scope.dataMaps = dataMaps;
    $scope.Modals = Modals;
    $scope.dataReports = DataReports.query();

    $scope.add = function(){
        DataReports.create({"name": "Run1", "status":"Error"});
    };
    var statusCheckPromise;

    $scope.statusCheck = function () {
        angular.forEach($scope.dataSets, function (dataSet) {
            if (!dataSet.status || dataSet.status.status !== 'complete') {
                var promises = [];

                promises.push(DataSets.getStatus(dataSet).then(function (response) {
                    dataSet.status = response.data;

                    if (dataSet.status.status === 'processing') {
                        dataSet.status.status += ' - ' + Math.floor(parseFloat(dataSet.status.percent)) + '%';
                    }
                }));

                promises.push(DataSets.getErrors(dataSet).then(function (response) {
                    dataSet.errors = response.data;
                }));

                $q.all(promises).then(function () {
                    if (dataSet.status.status !== 'complete') {
                        $timeout.cancel(statusCheckPromise);
                        statusCheckPromise = $timeout($scope.statusCheck, 1000);
                    }
                });
            }
        });
    };

    $scope.statusCheck();

    $scope.configureTimestamp = function ($index) {
        Files.head($scope.dataFiles[$index].id).then(function (headResponse) {
            if (headResponse.data.has_header) {
                headResponse.data.header = headResponse.data.rows.shift();
            }

            $scope.dataFiles[$index].head = headResponse.data;
            $scope.dataFiles[$index].cols = [];
            angular.forEach($scope.dataFiles[$index].head.rows[0], function (v, k) {
                $scope.dataFiles[$index].cols.push(k);
            });

            $scope.timestampFile = $scope.dataFiles[$index];
            Modals.openModal('configureTimestamp');
        });
    };

    $scope.upload = function (fileInput) {
        angular.forEach(fileInput[0].files, function(file) {
            $upload.upload({
                url: settings.API_URL + 'projects/' + project.id + '/add_file',
                file: file,
            }).then(function (response) {
                // Perform a 'get' so that the file object has $save and $delete methods
                Files.get(response.data.id).then(function (getResponse) {
                    $scope.dataFiles.push(getResponse);
                    $scope.configureTimestamp($scope.dataFiles.length - 1);
                });

                fileInput.val('').triggerHandler('change');
            });
        });
    };

    $scope.deleteFile = function ($index) {
        $scope.dataFiles[$index].$delete(function () {
            $scope.dataFiles.splice($index, 1);
        });
    };

    $scope.errorsModal = {};

    $scope.showErrors = function (dataSet) {
        $scope.errorsModal.files = {};

        // Create hash of data map file names to data file names
        angular.forEach(dataSet.files, function (file) {
            angular.forEach($scope.dataFiles, function (dataFile) {
                if (dataFile.id === file.file) {
                    $scope.errorsModal.files[file.name] = dataFile.file;
                }
            });

            if (!$scope.errorsModal.files[file.name]) {
                $scope.errorsModal.files[file.name] = 'File "' + file.name + '"';
            }
        });

        $scope.errorsModal.errors = dataSet.errors;
    };

    $scope.deleteDataSet = function ($index) {
        $scope.dataSets[$index].$delete(function () {
            $scope.dataSets.splice($index, 1);
        });
    };

    $scope.deleteDataMap = function ($index) {
        $scope.dataMaps[$index].$delete(function () {
            $scope.dataMaps.splice($index, 1);
        });
    };
})
.controller('TimestampCtrl', function ($scope, Files, $http, Modals) {
    $scope.modal = { columns: {}, };

    $scope.preview = function () {
        $scope.selectedColumns = [];

        angular.forEach($scope.modal.columns, function (selected, column) {
            if (selected === true) {
                $scope.selectedColumns.push(parseInt(column));
            }
        });

        $http({
            method: 'GET',
            url: settings.API_URL + 'files/' + $scope.timestampFile.id + '/timestamps?columns=' + $scope.selectedColumns.join(','),
            transformResponse: angular.fromJson,
        }).then(function (response) {
            $scope.modal.confirm = true;
            $scope.modal.timestamps = response.data;
        }, function (rejection) {
            alert(angular.toJson(rejection.data));
        });
    };

    $scope.save = function () {
        var timestamp = { columns: $scope.selectedColumns };

        Files.update({
            id: $scope.timestampFile.id,
            timestamp: timestamp,
        }).then(function (file) {
            $scope.timestampFile.timestamp = timestamp;
            Modals.closeModal('configureTimestamp');
        }, function (rejection) {
            alert(angular.toJson(rejection));
        });
    };
})
.controller('NewDataSetCtrl', function ($scope, DataSets, DataMaps, Modals) {
    DataMaps.ensureFileMetaData($scope.dataFiles);

    $scope.newDataSet = { files: {} };

    $scope.save = function () {
        var files = [];

        angular.forEach($scope.newDataSet.files, function (fileId, key) {
            files.push({ name: key, file: fileId });
        });

        DataSets.create({
            map: $scope.newDataSet.map.id,
            files: files,
        }).$promise.then(function (dataSet) {
            $scope.dataSets.push(dataSet);
            $scope.statusCheck();
            Modals.closeModal('newDataSet');
        }, function (rejection) {
            alert(angular.toJson(rejection, true));
        });
    };
})
.filter('hasSignature', function () {
    return function (items, signature) {
        var filtered = [];

        angular.forEach(items, function (item) {
            if (angular.equals(signature, item.signature)) {
                filtered.push(item);
            }
        });

        return filtered;
    };
})
.filter('hasTimestamp', function () {
    return function (items) {
        var filtered = [];

        angular.forEach(items, function (item) {
            if (item.timestamp) {
                filtered.push(item);
            }
        });

        return filtered;
    };
})
.controller('NewDataMapCtrl', function ($scope, DataMaps, Modals) {
    DataMaps.ensureFileMetaData($scope.dataFiles);

    $scope.newDataMap = {
        project: $scope.project.id,
        map: {
            version: 1,
            sensors: [],
        },
        valid: false,
    };

    $scope.$watch('newDataMap.map', function () {
        DataMaps.validateMap($scope.newDataMap.map)
            .then(function (result) {
                $scope.newDataMap.valid = result.valid;
            });
    }, true);

    $scope.save = function () {
        DataMaps.create($scope.newDataMap).$promise.then(function (dataMap) {
            $scope.dataMaps.push(dataMap);
            Modals.closeModal('newDataMap');
        }, function (rejection) {
            alert(rejection.data.__all__.join('\n'));
        });
    };

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.newDataMap.map.sensors.unshift(angular.copy($scope.newChild));
        $scope.newChild = {};
    };
})
.controller('NewDataReportCtrl', function ($scope, Applications, DataMaps, $q, Modals) {
    $scope.newDataReport = {};

    $scope.$watch('newDataReport.dataSet', function () {
        $scope.availableApps = [];

        if (!$scope.newDataReport.dataSet) {
            return;
        }

        // Data set has been selected, generate lists of available and required sensors
        // and compare for compatibility
        var mapPromise = DataMaps.get($scope.newDataReport.dataSet.map).$promise,
            appsPromise = Applications.query().$promise;

        $q.all({ map: mapPromise, apps: appsPromise }).then(function (resolve) {
            $scope.availableSensors = {};

            angular.forEach(resolve.map.map.sensors, function (sensor, topic) {
                if (!sensor.type) {
                    return;
                }

                if (!$scope.availableSensors.hasOwnProperty(sensor.type)) {
                    $scope.availableSensors[sensor.type] = [];
                }

                $scope.availableSensors[sensor.type].push(topic);
            });

            angular.forEach(resolve.apps, function (app) {
                var requiredCounts = {},
                    missingInputs = [];

                angular.forEach(app.inputs, function (input) {
                    if (!requiredCounts.hasOwnProperty(input.sensor_type)) {
                        requiredCounts[input.sensor_type] = 0;
                    }

                    requiredCounts[input.sensor_type] += input.count_min;
                });

                angular.forEach(requiredCounts, function (required, sensorType) {
                    var available = 0;

                    if ($scope.availableSensors[sensorType]) {
                        available = $scope.availableSensors[sensorType].length;
                    }

                    if (available < required) {
                        missingInputs.push(
                            'At least ' + required + ' ' + sensorType + ' required, ' + available + ' available in data set'
                        );
                    }
                });

                if (missingInputs.length) {
                    $scope.availableApps.push({
                        name: app.name,
                        missingInputs: missingInputs,
                    });
                    return;
                }

                $scope.availableApps.push(app);
            });
        });
    });

    var previousApp;

    $scope.$watch('newDataReport.application', function (newValue, oldValue) {
        // Reset configuration if application has changed
        if (newValue && newValue !== previousApp) {
            $scope.newDataReport.configuration = { parameters: {}, inputs: {} };

            // Initialize multi-sensor inputs
            angular.forEach(newValue.inputs, function (input, inputName) {
                if (input.count_min !== 1 || input.count_max !== 1) {
                    $scope.newDataReport.configuration.inputs[inputName] = [];

                    var i = 0;
                    while (i++ < input.count_min) {
                        $scope.newDataReport.configuration.inputs[inputName].push({});
                    }
                }
            });

            previousApp = newValue;
        }
    });

    $scope.canAddSensor = function (inputName, inputType) {
        var app = $scope.newDataReport.application,
            config = $scope.newDataReport.configuration;

        if (config.inputs[inputName].length >= $scope.availableSensors[inputType].length) {
            return false;
        }

        if (app.inputs[inputName].count_max && config.inputs[inputName].length >= app.inputs[inputName].count_max) {
            return false;
        }

        return true;
    };

    $scope.addInputSensor = function (inputName) {
        $scope.newDataReport.configuration.inputs[inputName].push({});
    };

    $scope.run = function () {
        alert(angular.toJson({
            dataset: $scope.newDataReport.dataSet.id,
            application: $scope.newDataReport.application.name,
            configuration: $scope.newDataReport.configuration,
        }, true));
        Modals.closeModal('newDataReport');
    };
});
