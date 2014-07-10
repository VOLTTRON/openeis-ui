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
        resource = $resource(settings.API_URL + 'files/:fileId', { fileId: '@id' }, {
            update: { method: 'PATCH' },
        });

    Files.get = function (fileId) {
        return resource.get({ fileId: fileId }).$promise;
    };

    Files.query = function (projectId) {
        return resource.query({ project: projectId }).$promise;
    };

    Files.update = function (file) {
        return resource.update(file).$promise;
    };

    Files.head = function (fileId) {
        return $http({
            method: 'GET',
            url: settings.API_URL + 'files/' + fileId + '/head?rows=5',
            transformResponse: angular.fromJson,
        });
    };
})
.service('DataSets', function ($resource, $http) {
    var DataSets = this,
        resource = $resource(settings.API_URL + 'datasets/:dataSetId', { dataSetId: '@id' }, {
            create: { method: 'POST' },
        });

    DataSets.create = function (dataSet) {
        return resource.create(dataSet);
    };

    DataSets.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    DataSets.getStatus = function (dataSet) {
        return $http({
            method: 'GET',
            url: settings.API_URL + 'datasets/' + dataSet.id + '/status',
            transformResponse: angular.fromJson,
        });
    };

    DataSets.getErrors = function (dataSet) {
        return $http({
            method: 'GET',
            url: settings.API_URL + 'datasets/' + dataSet.id + '/errors',
            transformResponse: angular.fromJson,
        });
    };
})
.service('DataMaps', function ($http, $resource, Files) {
    var DataMaps = this,
        resource = $resource(settings.API_URL + 'sensormaps/:mapId', { mapId: '@id' }, {
            create: { method: 'POST' },
        });

    DataMaps.get = function (mapId) {
        return resource.get({ mapId: mapId });
    };

    DataMaps.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    DataMaps.create = function (dataMap) {
        var copy = angular.copy(dataMap);
        copy.map = DataMaps.flattenMap(copy.map);
        return resource.create(copy);
    };

    DataMaps.getDefinition = function () {
        return $http.get(settings.GENERAL_DEFINITION_URL).then(function (response) {
            return response.data;
        });
    };

    DataMaps.getUnits = function () {
        return $http.get(settings.UNITS_URL).then(function (response) {
            return response.data;
        });
    };

    DataMaps.flattenMap = function (map) {
        var mapCopy = angular.copy(map),
            files = {},
            fileCounter = 0;

        function flattenObject(objects, topicBase) {
            var flattened = {};

            angular.forEach(objects, function(object) {
                if (object.deleted === true) {
                    return;
                }

                delete object.deleted;

                var topic = topicBase + object.name.replace('/', '-'),
                    sensors = object.sensors || {},
                    children = object.children || {};

                delete object.name;
                delete object.sensors;
                delete object.children;

                if (object.file) {
                    if (object.file.hasHeader) {
                        object.column = object.file.columns[parseInt(object.column)];
                    } else {
                        object.column = parseInt(object.column);
                    }

                    if (!files[object.file.file]) {
                        files[object.file.file] = {
                            key: fileCounter++ + '',
                            signature: object.file.signature,
                            timestamp: object.file.timestamp,
                        };
                    }

                    object.file = files[object.file.file].key;
                }

                flattened[topic] = object;

                angular.extend(flattened, flattenObject(sensors, topic + settings.DATAMAP_TOPIC_SEPARATOR));
                angular.extend(flattened, flattenObject(children, topic + settings.DATAMAP_TOPIC_SEPARATOR));
            });

            return flattened;
        }

        mapCopy.sensors = flattenObject(mapCopy.sensors, '');

        mapCopy.files = mapCopy.files || {};

        angular.forEach(files, function (file, key) {
            mapCopy.files[file.key] = file;
            delete mapCopy.files[file.key].key;
        });

        return mapCopy;
    };

    DataMaps.validateMap = function (map) {
        return $http.get(settings.DATAMAP_SCHEMA_URL)
            .then(function (response) {
                return tv4.validateMultiple(DataMaps.flattenMap(map), response.data);
            });
    };

    DataMaps.ensureFileMetaData = function (files) {
        angular.forEach(files, function(file) {
            if (!(file.hasOwnProperty('signature') && file.hasOwnProperty('columns') && file.hasOwnProperty('hasHeader'))) {
                Files.head(file.id).then(function (headResponse) {
                    file.signature = { headers: [] };
                    file.columns = [];
                    file.hasHeader = headResponse.data.has_header;

                    angular.forEach(headResponse.data.rows[0], function (v, k) {
                        if (file.hasHeader) {
                            file.signature.headers.push(v);
                            file.columns.push(v);
                        } else {
                            file.signature.headers.push(null);
                            file.columns.push("Column " + (k + 1));
                        }
                    });
                });
            }
        });
    };
})
.service('Applications', function ($resource) {
    var Applications = this,
        resource = $resource(settings.API_URL + 'applications');

    Applications.query = function () {
        return resource.query();
    };
})
.service('DataReports', function(){
    var DataReports = this;
    DataReports.query = function () {
        return [{"name": "p1", "status": "Queued"}, {"name":"p2","status": "Running"}, {"name":"p3","status":"Completed"}];
    };    
});

