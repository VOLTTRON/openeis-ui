angular.module('openeis-ui.auth', ['ngResource', 'ngRoute'])
.provider('authRoute', function ($routeProvider) {
    // Wrapper around $routeProvider to add check for auth status

    this.whenAnon = function (path, route) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { anon: ['Auth', function(Auth) { return Auth.requireAnon(); }] });
        $routeProvider.when(path, route);
        return this;
    };

    this.whenAuth = function (path, route) {
        route.resolve = route.resolve || {};
        angular.extend(route.resolve, { auth: ['Auth', function(Auth) { return Auth.requireAuth(); }] });
        $routeProvider.when(path, route);
        return this;
    };

    this.$get = $routeProvider.$get;
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
.service('Auth', function ($resource, API_URL, $q, LOGIN_PAGE, AUTH_HOME, $location) {
    var Auth = this,
        account = null,
        resource = $resource(API_URL + '/account', null, {
            create: { method: 'POST' },
            update: { method: 'PATCH' },
        }),
        loginResource = $resource(API_URL + '/account/login'),
        pwChangeResource = $resource(API_URL + '/account/change_password'),
        pwResetResource = $resource(API_URL + '/account/password_reset', null, {
            put: { method: 'PUT' },
        }),
        loginRedirect = null;

    Auth.account = function () {
        return account;
    };

    Auth.accountCreate = function (account) {
        return resource.create(account).$promise;
    };

    Auth.accountUpdate = function (account) {
        return resource.update(account).$promise;
    };

    Auth.accountPassword = function (password) {
        return pwChangeResource.save(password).$promise;
    };

    Auth.accountRecover1 = function (id) {
        return pwResetResource.save({ username_or_email: id }).$promise;
    };

    Auth.accountRecover2 = function (params) {
        return pwResetResource.put(params).$promise;
    };

    Auth.init = function () {
        var deferred = $q.defer();

        resource.get(function (response) {
            account = response;
            deferred.resolve();
        }, function () {
            account = false;
            deferred.resolve();
        });

        return deferred.promise;
    };

    Auth.logIn = function(credentials) {
        var deferred = $q.defer();

        loginResource.save(credentials, function () {
            Auth.init().then(function () {
                if (loginRedirect !== null) {
                    $location.url(loginRedirect);
                    loginRedirect = null;
                } else {
                    $location.url(AUTH_HOME);
                }
                deferred.resolve();
            });
        }, function (rejection) {
            deferred.reject(rejection);
        });

        return deferred.promise;
    };

    Auth.logOut = function() {
        var deferred = $q.defer();

        loginResource.delete(function () {
            account = false;
            $location.url(LOGIN_PAGE);
            deferred.resolve();
        }, function (rejection) {
            deferred.reject(rejection);
        });

        return deferred.promise;
    };

    Auth.requireAnon = function () {
        var deferred = $q.defer();

        function check() {
            if (account) {
                $location.url(AUTH_HOME);
                deferred.reject();
            } else {
                deferred.resolve();
            }
        }

        if (account === null) {
            Auth.init().then(function () {
                check();
            });
        } else {
            check();
        }

        return deferred.promise;
    };

    Auth.requireAuth = function () {
        var deferred = $q.defer();

        function check() {
            if (!account) {
                loginRedirect = $location.url();
                $location.url(LOGIN_PAGE);
                deferred.reject();
            } else {
                deferred.resolve();
            }
        }

        if (account === null) {
            Auth.init().then(function () {
                check();
            });
        } else {
            check();
        }

        return deferred.promise;
    };
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
.controller('SignUpCtrl', function ($scope, $location, Auth, AUTH_HOME) {
    $scope.form = {};

    $scope.submit = function () {
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
    $scope.account = Auth.account();

    $scope.profile = {
        clearAlerts: function () {
            $scope.profile.success = false;
            $scope.profile.error = false;
        },
        update: function () {
            $scope.profile.clearAlerts();

            Auth.accountUpdate({
                first_name: $scope.account.first_name,
                last_name: $scope.account.last_name,
                email: $scope.account.email,
            }).then(function (response) {
                $scope.profile.success = true;
                $timeout($scope.profile.clearAlerts, 2000);
            }, function (rejection) {
                $scope.profile.error = rejection.status;
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
    $scope.account = Auth.account();

    $scope.logOut = function () {
        Auth.logOut();
    };
});
