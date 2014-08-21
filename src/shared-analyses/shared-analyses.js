angular.module('openeis-ui.shared-analyses', [
    'openeis-ui.analyses',
    'openeis-ui.auth-route-service',
    'openeis-ui.shared-analyses.shared-analyses-controller',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .when('/shared-analyses/:analysisId/:key', {
            controller: 'SharedAnalysesCtrl',
            templateUrl: 'src/shared-analyses/shared-analyses.tpl.html',
        });
});
