angular.module('openeis-ui.projects', [
    'openeis-ui.api', 'openeis-ui.auth', 'openeis-ui.file', 'openeis-ui.modal',
    'openeis-ui.sensor-container', 'ngResource', 'angularFileUpload',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/projects', {
            controller: 'ProjectsCtrl',
            templateUrl: 'partials/projects.html',
            resolve: {
                projects: ['Projects', function(Projects) {
                    return Projects.query();
                }]
            },
        })
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
                sensorMaps: ['SensorMaps', '$route', function(SensorMaps, $route) {
                    return SensorMaps.query($route.current.params.projectId).$promise;
                }],
            },
        });
})
.controller('ProjectsCtrl', function ($scope, projects, Projects) {
    $scope.projects = projects;

    $scope.newProject = {
        name: '',
        create: function () {
            Projects.create({ name: $scope.newProject.name }).then(function (response) {
                $scope.newProject.name = '';
                $scope.projects.push(response);
            });
        },
    };

    $scope.renameProject = function ($index) {
        var newName = prompt("New project name:");

        if (!newName || !newName.length) {
            return;
        }

        $scope.projects[$index].name = newName;
        $scope.projects[$index].$save(function (response) {
            $scope.projects[$index] = response;
        });
    };

    $scope.deleteProject = function ($index) {
        $scope.projects[$index].$delete(function () {
            $scope.projects.splice($index, 1);
        });
    };
})
.controller('ProjectCtrl', function ($scope, project, dataFiles, Files, dataSets, DataSets, sensorMaps, $upload, $timeout, $q) {
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = dataSets;
    $scope.sensorMaps = sensorMaps;

    var statusCheckPromise;

    $scope.statusCheck = function () {
        angular.forEach(dataSets, function (dataSet) {
            if (!dataSets.status || dataSets.status.status !== 'complete') {
                var promises = [];

                promises.push(DataSets.getStatus(dataSet).then(function (response) {
                    dataSet.status = response.data;
                }));

                promises.push(DataSets.getErrors(dataSet).then(function (response) {
                    dataSet.errors = response.data;
                }));

                $q.all(promises).then(function () {
                    if (dataSet.status.status !== 'complete') {
                        $timeout.cancel(statusCheckPromise);
                        statusCheckPromise = $timeout($scope.statusCheck, 5000);
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
        });
    };

    $scope.closeTimestampModal = function () {
        delete $scope.timestampFile;
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

    $scope.closeNewDataSetModal = function () {
        $scope.newDataSetModal = false;
    };

    $scope.errorsModal = {};

    $scope.showErrors = function (dataSet) {
        $scope.errorsModal.files = {};

        // Create hash of sensor map file names to data file names
        angular.forEach(dataSet.files, function (file) {
            angular.forEach(dataFiles, function (dataFile) {
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

    $scope.closeNewSensorMapModal = function () {
        $scope.newSensorMapModal = false;
    };

    $scope.deleteSensorMap = function ($index) {
        $scope.sensorMaps[$index].$delete(function () {
            $scope.sensorMaps.splice($index, 1);
        });
    };
})
.controller('TimestampCtrl', function ($scope, Files, $http) {
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
            $scope.closeTimestampModal();
        }, function (rejection) {
            alert(angular.toJson(rejection));
        });
    };
})
.controller('NewDataSetCtrl', function ($scope, DataSets, SensorMaps) {
    SensorMaps.ensureFileMetaData($scope.dataFiles);

    $scope.newDataMap = { files: {} };

    $scope.filesWithSignature = function (key) {
        var files = [];

        angular.forEach($scope.dataFiles, function (file) {
            if (angular.equals(file.signature, $scope.newDataMap.map.map.files[key].signature)) {
                files.push(file);
            }
        });

        return files;
    };

    $scope.save = function () {
        var files = [];

        angular.forEach($scope.newDataMap.files, function (fileId, key) {
            files.push({ name: key, file: fileId });
        });

        DataSets.create({
            map: $scope.newDataMap.map.id,
            files: files,
        }).$promise.then(function (dataSet) {
            $scope.dataSets.push(dataSet);
            $scope.statusCheck();
            $scope.closeNewDataSetModal();
        }, function (rejection) {
            alert(angular.toJson(rejection, true));
        });
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
.controller('NewSensorMapCtrl', function ($scope, SensorMaps) {
    SensorMaps.ensureFileMetaData($scope.dataFiles);

    $scope.newSensorMap = {
        project: $scope.project.id,
        map: {
            version: 1,
            files: {},
            sensors: [],
        },
        valid: false,
    };

    $scope.$watch('newSensorMap.map', function () {
        SensorMaps.validateMap($scope.newSensorMap.map)
            .then(function (result) {
                $scope.newSensorMap.valid = result.valid;
            });
    }, true);

    $scope.save = function () {
        SensorMaps.create($scope.newSensorMap).$promise.then(function (sensorMap) {
            $scope.sensorMaps.push(sensorMap);
            $scope.closeNewSensorMapModal();
        }, function (rejection) {
            alert(rejection.data.__all__.join('\n'));
        });
    };

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.newSensorMap.map.sensors.unshift(angular.copy($scope.newChild));
        $scope.newChild = {};
    };
});
