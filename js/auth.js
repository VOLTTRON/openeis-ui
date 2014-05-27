angular.module('openeis-ui.auth', ['openeis-ui.api', 'ngRoute'])
.provider('authRoute', function ($routeProvider) {
    // Wrapper around $routeProvider to add check for auth status

    this.whenAnon = function (path, route) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { anon: ['authRoute', function(authRoute) { return authRoute.requireAnon(); }] });
        $routeProvider.when(path, route);
        return this;
    };

    this.whenAuth = function (path, route) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { auth: ['authRoute', function(authRoute) { return authRoute.requireAuth(); }] });
        $routeProvider.when(path, route);
        return this;
    };

    this.$get = function (Auth, $q, $location) {
        return {
            requireAnon: function () {
                var deferred = $q.defer();

                Auth.account().then(function (account) {
                    if (account) {
                        $location.url(settings.AUTH_HOME);
                        deferred.reject();
                    } else {
                        deferred.resolve();
                    }
                });

                return deferred.promise;
            },
            requireAuth: function () {
                var deferred = $q.defer();

                Auth.account().then(function (account) {
                    if (account) {
                        deferred.resolve();
                    } else {
                        Auth.loginRedirect($location.url());
                        $location.url(settings.LOGIN_PAGE);
                        deferred.reject();
                    }
                });

                return deferred.promise;
            },
        };
    };
})
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAnon('/', {
            controller: 'LoginCtrl',
            templateUrl: 'partials/login.html',
        })
        .whenAnon('/sign-up', {
            controller: 'SignUpCtrl',
            templateUrl: 'partials/signup.html',
        })
        .whenAnon('/recovery', {
            controller: 'RecoveryCtrl',
            templateUrl: 'partials/recovery.html',
        })
        .whenAuth('/account', {
            controller: 'AccountCtrl',
            templateUrl: 'partials/account.html',
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
})
.controller('TopBarCtrl', function ($scope, Auth) {
    $scope.$on('accountChange', function () {
        Auth.account().then(function (account) {
            $scope.account = account;
        });
    });

    $scope.logOut = function () {
        Auth.logOut();
    };
});
