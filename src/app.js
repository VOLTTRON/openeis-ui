var base = document.getElementsByTagName('base')[0];
if (base) { base.setAttribute('href', settings.BASE_HREF); }

angular.module('openeis-ui', [
    'openeis-ui.auth', 'openeis-ui.projects', 'openeis-ui.templates',
    'ngAnimate', 'ngRoute',
])
.config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .otherwise({
            templateUrl: 'src/404.tpl.html',
        });

    $locationProvider.html5Mode(true);

    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
})
.controller('AppCtrl', function ($scope, Modals) {
    $scope.modalOpen = Modals.modalOpen;
})
.run(function ($rootScope, $rootElement) {
    $rootScope.$on('$viewContentLoaded', function () {
        window.setTimeout(function() {
            $rootElement.find('input').checkAndTriggerAutoFillEvent();
        }, 200);
    });
});
