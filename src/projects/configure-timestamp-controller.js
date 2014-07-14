angular.module('openeis-ui.projects.configure-timestamp-controller', [
    'openeis-ui.modals',
    'openeis-ui.projects.data-files',
])
.controller('ConfigureTimestampCtrl', function ($scope, DataFiles, $http, Modals) {
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

        DataFiles.update({
            id: $scope.timestampFile.id,
            timestamp: timestamp,
        }).then(function (file) {
            $scope.timestampFile.timestamp = timestamp;
            Modals.closeModal('configureTimestamp');
        }, function (rejection) {
            alert(angular.toJson(rejection));
        });
    };
});
