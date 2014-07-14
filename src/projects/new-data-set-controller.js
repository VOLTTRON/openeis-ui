angular.module('openeis-ui.projects.new-data-set-controller', [
    'openeis-ui.modals',
    'openeis-ui.projects.data-maps',
    'openeis-ui.projects.data-sets',
])
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
});
