angular.module('openeis-ui.projects.new-data-map-controller', [
    'openeis-ui.modals',
    'openeis-ui.projects.data-maps',
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

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.newDataMap.map.sensors.unshift(angular.copy($scope.newChild));
        $scope.newChild = {};
    };
});
