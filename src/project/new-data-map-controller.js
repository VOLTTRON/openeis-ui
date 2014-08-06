angular.module('openeis-ui.project.new-data-map-controller', [
    'openeis-ui.modals',
    'openeis-ui.data-maps',
])
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

    $scope.addChild = function (childLevel) {
        var name,
            promptMessage = 'Name:',
            hasName = function (element) {
                return (element.name === name);
            };

        do {
            name = prompt(promptMessage);
            if (!name) { return; }
            name = name.replace('/', '-');
            promptMessage = 'Error: "' + name + '" already exists. Name:';
        } while ($scope.newDataMap.map.sensors.some(hasName));

        $scope.newDataMap.map.sensors.unshift({
            level: childLevel,
            name: name,
        });
    };
});
