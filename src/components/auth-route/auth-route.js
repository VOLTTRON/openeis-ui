angular.module('openeis-ui.auth-route', ['openeis-ui.auth', 'ngRoute'])
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
});
