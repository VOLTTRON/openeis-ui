angular.module('openeis-ui.api', ['ngResource'])
.service('Auth', function ($resource, $q, $location, $rootScope) {
    var Auth = this,
        account = null,
        resource = $resource(settings.API_URL + 'account', null, {
            create: { method: 'POST' },
            update: { method: 'PATCH' },
        }),
        loginResource = $resource(settings.API_URL + 'account/login'),
        pwChangeResource = $resource(settings.API_URL + 'account/change_password'),
        pwResetResource = $resource(settings.API_URL + 'account/password_reset', null, {
            put: { method: 'PUT' },
        }),
        loginRedirect = null;

    function updateAccount() {
        var deferred = $q.defer();

        resource.get().$promise
            .then(function (response) {
                account = response;
            }, function () {
                account = false;
            })
            .finally(function () {
                $rootScope.$broadcast('accountChange');
                deferred.resolve(account);
            });

        return deferred.promise;
    }

    Auth.account = function () {
        if (account === null) {
            return updateAccount();
        }

        var deferred = $q.defer();
        deferred.resolve(account);
        return deferred.promise;
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

    Auth.logIn = function (credentials) {
        var deferred = $q.defer();

        loginResource.save(credentials, function () {
            updateAccount().then(function () {
                if (loginRedirect !== null) {
                    $location.url(loginRedirect);
                    loginRedirect = null;
                } else {
                    $location.url(settings.AUTH_HOME);
                }
                deferred.resolve();
            });
        }, function (rejection) {
            deferred.reject(rejection);
        });

        return deferred.promise;
    };

    Auth.loginRedirect = function (url) {
        loginRedirect = url;
    };

    Auth.logOut = function () {
        var deferred = $q.defer();

        loginResource.delete(function () {
            account = false;
            $rootScope.$broadcast('accountChange');
            $location.url(settings.LOGIN_PAGE);
            deferred.resolve();
        }, function (rejection) {
            deferred.reject(rejection);
        });

        return deferred.promise;
    };
})
.service('Projects', function ($resource) {
    var Projects = this,
        resource = $resource(settings.API_URL + 'projects/:projectId', { projectId: '@id' }, {
            create: { method: 'POST' },
            save: { method: 'PUT' },
        });

    Projects.get = function (projectId) {
        return resource.get({ projectId: projectId}).$promise;
    };

    Projects.query = function () {
        return resource.query().$promise;
    };

    Projects.create = function (project) {
        return resource.create(project).$promise;
    };
})
.service('Files', function ($resource, $http) {
    var Files = this,
        resource = $resource(settings.API_URL + 'files/:fileId', { fileId: '@id' });

    Files.get = function (fileId) {
        return resource.get({ fileId: fileId }).$promise;
    };

    Files.query = function (projectId) {
        return resource.query({ project: projectId }).$promise;
    };

    Files.head = function (fileId) {
        return $http({
            method: 'GET',
            url: settings.API_URL + 'files/' + fileId + '/head?rows=5',
            transformResponse: angular.fromJson,
        });
    };
});
