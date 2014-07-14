angular.module('openeis-ui.recovery', [
    'openeis-ui.auth-service',
    'openeis-ui.auth-route-service',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAnon('/recovery', {
            controller: 'RecoveryCtrl',
            templateUrl: 'src/recovery/recovery.tpl.html',
        });
})
.controller('RecoveryCtrl', function ($scope, Auth, $routeParams) {
    $scope.form = {
        stage: 1,
    };

    if ($routeParams.username && $routeParams.code) {
        $scope.form.stage = 2;

        $scope.recovery = {
            username: $routeParams.username,
            code: $routeParams.code,
        };
    } else {
        $scope.recovery = {};
    }

    $scope.submit = function () {
        switch ($scope.form.stage) {
            case 1:
                Auth.accountRecover1($scope.recovery.id).then(function () {
                    $scope.form.success = 'Email with temporary password reset link sent.';
                    $scope.form.stage = false;
                    $scope.clearError();
                }, function (rejection) {
                    if (rejection.status === 404) {
                        rejection.data = 'Account with specified username or email address not found.';
                    }
                    $scope.form.error = rejection;
                });
                return;

            case 2:
                if ($scope.recovery.password !== $scope.recovery.passwordConfirm) {
                    $scope.form.error = {
                        status: 400,
                        data: 'Passwords do not match.',
                    };
                    return;
                }

                Auth.accountRecover2($scope.recovery).then(function () {
                    $scope.form.success = 'Password updated.';
                    $scope.form.stage = false;
                    $scope.clearError();
                }, function (rejection) {
                    if (rejection.status === 404) {
                        rejection.data = 'Invalid password reset link.';
                    }
                    $scope.form.error = rejection;
                });
                return;
        }
    };
    $scope.clearError = function () {
        $scope.form.error = false;
    };
});
