angular.module('openeis-ui.sensor-map', ['openeis-ui.api', 'RecursionHelper'])
.directive('sensorContainer', function (RecursionHelper) {
    return {
        replace: true,
        restrict: 'E',
        scope: {
            files: '=',
            container: '=',
        },
        templateUrl: 'partials/sensor-container.html',
        controller: function ($scope, sensorMaps) {
            sensorMaps.getDefinition().then(function (definition) {
                $scope.definition = definition;

                if ($scope.container.level === 'system') {
                    $scope.objectDefinition = definition.systems[$scope.container.name];
                } else {
                    $scope.objectDefinition = definition[$scope.container.level];
                }
            });

            sensorMaps.getUnits().then(function (units) {
                $scope.units = units;
            });

            $scope.newAttribute = {};

            $scope.addAttribute = function () {
                if ($scope.newAttribute.name === 'address') {
                    $scope.newAttribute.value = {
                        address: '123 Anystreet',
                        city: 'Anytown',
                        state: 'US',
                        zip_code: '12345',
                    };
                }

                $scope.container.attributes = $scope.container.attributes || {};
                $scope.container.attributes[$scope.newAttribute.name] = angular.copy($scope.newAttribute.value);
                $scope.objectDefinition.attribute_list.splice(
                    $scope.objectDefinition.attribute_list.indexOf($scope.newAttribute.name), 1
                );
                $scope.newAttribute = {};
                $scope.$emit('sensorMapChange');
            };

            $scope.newSensor = {};

            $scope.addSensor = function () {
                $scope.newSensor.type = $scope.newSensor.name;
                $scope.container.sensors = $scope.container.sensors || [];
                $scope.container.sensors.unshift(angular.copy($scope.newSensor));
                $scope.objectDefinition.sensor_list.splice(
                    $scope.objectDefinition.sensor_list.indexOf($scope.newSensor.name), 1
                );
                $scope.newSensor = {};
                $scope.$emit('sensorMapChange');
            };

            $scope.newSystem = {};

            $scope.addSystem = function () {
                $scope.newSystem.level = 'system';
                $scope.container.children = $scope.container.children || [];
                $scope.container.children.unshift(angular.copy($scope.newSystem));
                $scope.newSystem = {};
                $scope.$emit('sensorMapChange');
            };

            $scope.newChild = {};

            $scope.addChild = function () {
                $scope.newChild.name = $scope.newChild.name.replace('/', '-');
                $scope.container.children = $scope.container.children || [];
                $scope.container.children.unshift(angular.copy($scope.newChild));
                $scope.newChild = {};
                $scope.$emit('sensorMapChange');
            };
        },
        compile: function(element) {
            return RecursionHelper.compile(element);
        },
    };
})
.controller('SensorMapCtrl', function ($scope, sensorMaps) {
    // TODO: use actual columns, instead of these fake ones
    angular.forEach($scope.dataFiles, function (file, key) {
        $scope.dataFiles[key].columns = [
            file.file + ' - Col1',
            file.file + ' - Col2',
            file.file + ' - Col3',
        ];
    });

    $scope.newSensorMap = {
        project: $scope.project.id,
        map: {
            version: 1,
            files: {},
            sensors: [],
        },
        valid: false,
    };

    $scope.$on('sensorMapChange', function () {
        sensorMaps.validateMap($scope.newSensorMap.map)
            .then(function (result) {
                $scope.newSensorMap.valid = result.valid;
            });
    });

    $scope.save = function () {
        sensorMaps.create($scope.newSensorMap).$promise.then(function (response) {
            $scope.sensorMaps.push(response);
            $scope.closeSensorMapModal();
        });
    };

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.newSensorMap.map.sensors.unshift(angular.copy($scope.newChild));
        $scope.$emit('sensorMapChange');
        $scope.newChild = {};
    };
});
