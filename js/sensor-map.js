angular.module('openeis-ui.sensor-map', ['RecursionHelper'])
.directive('sensorContainer', function (RecursionHelper) {
    return {
        replace: true,
        restrict: 'E',
        scope: {
            container: '=',
        },
        templateUrl: 'partials/sensor-container.html',
        controller: function ($scope, sensorMap) {
            sensorMap.getDefinition().then(function (definition) {
                $scope.definition = definition;

                if ($scope.container.level === 'system') {
                    $scope.objectDefinition = definition.systems[$scope.container.name];
                } else {
                    $scope.objectDefinition = definition[$scope.container.level];
                }
            });

            sensorMap.getUnits().then(function (units) {
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
.service('sensorMap', function ($http, $q) {
    var sensorMap = this;

    sensorMap.getDefinition = function () {
        return $http.get(settings.SENSORMAP_DEFINITION_URL).then(function (response) {
            return response.data;
        });
    };

    sensorMap.getUnits = function () {
        return $http.get(settings.SENSORMAP_UNITS_URL).then(function (response) {
            return response.data;
        });
    };
})
.service('sensorMapValidator', function ($http, $q) {
    var Validator = this;

    Validator.validate = function (sensorMap) {
        function flatten(topicBase, containers) {
            var flattened = {};

            angular.forEach(containers, function(container) {
                var topic = topicBase + container.name.replace('/', '-'),
                    sensors = container.sensors || {},
                    children = container.children || {};

                delete container.name;
                delete container.sensors;
                delete container.children;

                flattened[topic] = container;

                angular.extend(flattened, flatten(topic + settings.SENSORMAP_TOPIC_SEPARATOR, sensors));
                angular.extend(flattened, flatten(topic + settings.SENSORMAP_TOPIC_SEPARATOR, children));
            });

            return flattened;
        }

        var mapCopy = angular.copy(sensorMap);
        mapCopy.sensors = flatten('', mapCopy.sensors);

        return $http.get(settings.SENSORMAP_SCHEMA_URL)
            .then(function (response) {
                return {
                    json: mapCopy,
                    result: tv4.validateMultiple(mapCopy, response.data),
                };
            });
    };
})
.controller('SensorMapCtrl', function ($scope, sensorMapValidator) {
    $scope.validate = function () {
        sensorMapValidator.validate($scope.modal.sensorMap)
            .then(function (response) {
                if (!response.result.valid) {
                    angular.forEach(response.result.errors, function (v, k) {
                        response.result.errors[k].stack = null;
                    });
                }

                $scope.modal.result = response.result;
                $scope.modal.json = response.json;
            });
    };

    $scope.$on('sensorMapChange', function () {
        $scope.validate();
    });

    $scope.validate();

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.modal.sensorMap.sensors.unshift(angular.copy($scope.newChild));
        $scope.$emit('sensorMapChange');
        $scope.newChild = {};
    };

    $scope.modal.close = function () {
        $scope.modal.sensorMap = null;
    };
});
