angular.module('openeis-ui.shared-analyses.shared-analyses-controller', [])
.controller('SharedAnalysesCtrl', function ($scope, SharedAnalyses, $routeParams, $location) {
    $scope.valid = true;

    SharedAnalyses.get($routeParams.analysisId, $routeParams.key).$promise.then(function (sharedAnalysis) {
        SharedAnalyses.getData(sharedAnalysis.analysis, $routeParams.key).then(function (data) {
            $scope.sharedAnalysis = sharedAnalysis;
            $scope.data = data;
        });
    }, function () {
        $scope.valid = false;
    });
});
