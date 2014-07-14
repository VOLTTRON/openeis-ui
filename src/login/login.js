angular.module('openeis-ui.login', [
    'openeis-ui.auth',
    'openeis-ui.auth-route',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAnon('/', {
            controller: 'LoginCtrl',
            templateUrl: 'src/login/login.tpl.html',
        });
})
.controller('LoginCtrl', function ($scope, Auth) {
    $scope.logIn = function () {
        Auth.logIn({
            username: $scope.form.username,
            password: $scope.form.password,
        }).catch(function (rejection) {
            $scope.form.error = rejection.status;
        });
    };
    $scope.clearError = function () {
        $scope.form.error = null;
    };
});
