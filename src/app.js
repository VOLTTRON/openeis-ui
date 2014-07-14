var base = document.getElementsByTagName('base')[0];
if (base) { base.setAttribute('href', settings.BASE_HREF); }

angular.module('openeis-ui', [
    'ngAnimate',
    'ngRoute',
    'openeis-ui.account',
    'openeis-ui.api',
    'openeis-ui.auth-service',
    'openeis-ui.login',
    'openeis-ui.project',
    'openeis-ui.projects',
    'openeis-ui.recovery',
    'openeis-ui.signup',
    'openeis-ui.templates',
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
.controller('AppCtrl', function ($scope, Modals, Auth) {
    $scope.modalOpen = Modals.modalOpen;

    $scope.$on('accountChange', function () {
        Auth.account().then(function (account) {
            $scope.account = account;
        });
    });

    $scope.logOut = function () {
        Auth.logOut();
    };
})
.run(function ($rootScope, $rootElement) {
    $rootScope.$on('$viewContentLoaded', function () {
        window.setTimeout(function() {
            $rootElement.find('input').checkAndTriggerAutoFillEvent();
        }, 200);
    });
});
