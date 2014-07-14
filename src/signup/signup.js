angular.module('openeis-ui.signup', [
    'openeis-ui.api',
    'openeis-ui.auth-route',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAnon('/sign-up', {
            controller: 'SignUpCtrl',
            templateUrl: 'src/signup/signup.tpl.html',
        });
})
.controller('SignUpCtrl', function ($scope, $location, Auth) {
    $scope.form = {};

    $scope.submit = function () {
        if ($scope.account.password !== $scope.account.passwordConfirm) {
            $scope.form.passwordConfirm = 'Passwords do not match.';
            return;
        }

        Auth.accountCreate($scope.account).then(function (response) {
            Auth.logIn({
                username: $scope.account.username,
                password: $scope.account.password,
            }).catch(function (rejection) {
                $scope.form.error = rejection.status;
            });
        }, function (rejection) {
            if (rejection.status === 400) {
                angular.forEach(rejection.data, function (v, k) {
                    if (angular.isArray(v)) {
                        rejection.data[k] = v.join('<br>');
                    }
                });
            }
            $scope.form.error = rejection;
        });
    };
    $scope.clearError = function () {
        $scope.form.error = null;
    };
});
