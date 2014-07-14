angular.module('openeis-ui.project', [
    'openeis-ui.api',
    'openeis-ui.filters',
    'openeis-ui.modals',
    'openeis-ui.sensor-container',
])
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
