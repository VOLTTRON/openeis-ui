angular.module('openeis-ui.project.new-analysis-controller', [
    'openeis-ui.applications-service',
    'openeis-ui.filters',
    'openeis-ui.modals',
    'openeis-ui.data-maps',
    'openeis-ui.analyses',
])
.controller('NewAnalysisCtrl', function ($scope, Applications, DataMaps, $q, Modals, Analyses) {
    $scope.newAnalysis = {};

    $scope.$watch('newAnalysis.dataSet', function () {
        $scope.availableApps = [];

        if (!$scope.newAnalysis.dataSet) {
            return;
        }

        // Data set has been selected, generate lists of available and required sensors
        // and compare for compatibility
        var mapPromise = DataMaps.get($scope.newAnalysis.dataSet.map).$promise,
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

    $scope.$watch('newAnalysis.application', function (newValue, oldValue) {
        // Reset configuration if application has changed
        if (newValue && newValue !== previousApp) {
            $scope.newAnalysis.configuration = { parameters: {}, inputs: {} };

            // Initialize multi-sensor inputs
            angular.forEach(newValue.inputs, function (input, inputName) {
                $scope.newAnalysis.configuration.inputs[inputName] = [];

                var i = 0;
                while (i++ < input.count_min) {
                    $scope.newAnalysis.configuration.inputs[inputName].push({});
                }
            });

            previousApp = newValue;
        }
    });

    $scope.canAddSensor = function (inputName, inputType) {
        var app = $scope.newAnalysis.application,
            config = $scope.newAnalysis.configuration;

        if (config.inputs[inputName].length >= $scope.availableSensors[inputType].length) {
            return false;
        }

        if (app.inputs[inputName].count_max && config.inputs[inputName].length >= app.inputs[inputName].count_max) {
            return false;
        }

        return true;
    };

    $scope.addInputSensor = function (inputName) {
        $scope.newAnalysis.configuration.inputs[inputName].push({});
    };

    $scope.deleteInputSensor = function (inputName, index) {
        $scope.newAnalysis.configuration.inputs[inputName].splice(index, 1);
    };

    $scope.run = function () {
        Analyses.create({
            name: 'Data set ' + $scope.newAnalysis.dataSet.id + ' - ' + $scope.newAnalysis.application.name,
            dataset: $scope.newAnalysis.dataSet.id,
            application: $scope.newAnalysis.application.name,
            configuration: $scope.newAnalysis.configuration,
        }).$promise.then(function (analysis) {
            $scope.analyses.push(analysis);
            $scope.statusCheck();
            Modals.closeModal('newAnalysis');
        }, function (rejection) {
            alert(angular.toJson(rejection.data, true));
        });

    };
});
