angular.module('openeis-ui.account', [
    'openeis-ui.auth-service',
    'openeis-ui.auth-route-service',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/account', {
            controller: 'AccountCtrl',
            templateUrl: 'src/account/account.tpl.html',
        });
})
.controller('AccountCtrl', function ($scope, Auth, $timeout) {
    var accountOrig;

    Auth.account().then(function (account) {
        $scope.account = account;
        accountOrig = angular.copy(account);
    });

    $scope.$watchCollection('account', function (newValue) {
        if (newValue.first_name !== accountOrig.first_name ||
            newValue.email != accountOrig.email) {
            $scope.profile.changed = true;
        } else {
            $scope.profile.changed = false;
        }
    });

    $scope.profile = {
        clearAlerts: function () {
            $scope.profile.success = false;
            $scope.profile.error = false;
        },
        update: function () {
            $scope.profile.clearAlerts();

            Auth.accountUpdate({
                first_name: $scope.account.first_name,
                email: $scope.account.email,
            }).then(function (response) {
                $scope.profile.success = true;
                $scope.profile.changed = false;
                accountOrig = angular.copy($scope.account);
                $timeout($scope.profile.clearAlerts, 2000);
            }, function (rejection) {
                if (rejection.status === 400) {
                    angular.forEach(rejection.data, function (v, k) {
                        if (angular.isArray(v)) {
                            rejection.data[k] = v.join('<br>');
                        }
                    });
                }

                $scope.profile.error = rejection;
            });
        },
    };

    $scope.password = {
        clearAlerts: function () {
            $scope.password.mismatch = false;
            $scope.password.success = false;
            $scope.password.error = false;
        },
        update: function () {
            $scope.password.clearAlerts();

            if ($scope.password.new !== $scope.password.newConfirm) {
                $scope.password.mismatch = true;
                return;
            }

            Auth.accountPassword({
                old_password: $scope.password.current,
                new_password: $scope.password.new,
            }).then(function (response) {
                $scope.password.success = true;
                $scope.password.current = '';
                $scope.password.new = '';
                $scope.password.newConfirm = '';
                $timeout($scope.password.clearAlerts, 2000);
            }, function (rejection) {
                if (rejection.status === 400) {
                    angular.forEach(rejection.data, function (v, k) {
                        if (angular.isArray(v)) {
                            rejection.data[k] = v.join('<br>');
                        }
                    });
                }
                $scope.password.error = rejection;
            });
        },
    };
});
