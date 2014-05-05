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
        resource = $resource(API_URL + '/account'),
        loginResource = $resource(API_URL + '/account/login'),
        resetResource = $resource(API_URL + '/account/password_reset'),
        loginRedirect = null;

    Auth.account = function () {
        return account;
    };

    Auth.accountRecover = function (id) {
        return resetResource.save({ username_or_email: id }).$promise;
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
    $scope.signUp = function () {
        console.log($scope.form);
    };
})
.controller('RecoveryCtrl', function ($scope, $location, Auth) {
    $scope.submit = function () {
        Auth.accountRecover($scope.form.id).then(function () {
            $scope.form.success = true;
        }, function (rejection) {
            $scope.form.error = rejection.status;
        });
    };
    $scope.clearError = function () {
        $scope.form.error = null;
    };
})
.controller('AccountCtrl', function ($scope, Auth) {
    $scope.form = {
        changed: false,
        submit: function () {
            console.log($scope.account);
        },
    };

    $scope.account = Auth.account();

    $scope.$watchCollection('account', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.form.changed = true;
        }
    });
})
.controller('TopBarCtrl', function ($scope, Auth) {
    $scope.account = Auth.account();

    $scope.logOut = function () {
        Auth.logOut();
    };
});
