angular.module('openeis-ui.data-files', ['ngResource'])
.service('DataFiles', function ($resource, $http) {
    var DataFiles = this,
        resource = $resource(settings.API_URL + 'files/:fileId', { fileId: '@id' }, {
            update: { method: 'PATCH' },
        });

    DataFiles.get = function (fileId) {
        return resource.get({ fileId: fileId }).$promise;
    };

    DataFiles.query = function (projectId) {
        return resource.query({ project: projectId }).$promise;
    };

    DataFiles.update = function (file) {
        return resource.update(file).$promise;
    };

    DataFiles.head = function (fileId) {
        return $http({
            method: 'GET',
            url: settings.API_URL + 'files/' + fileId + '/head?rows=5',
            transformResponse: angular.fromJson,
        });
    };
})
.filter('hasSignature', function () {
    return function (items, signature) {
        var filtered = [];

        angular.forEach(items, function (item) {
            if (angular.equals(signature, item.signature)) {
                filtered.push(item);
            }
        });

        return filtered;
    };
})
.filter('hasTimestamp', function () {
    return function (items) {
        var filtered = [];

        angular.forEach(items, function (item) {
            if (item.timestamp) {
                filtered.push(item);
            }
        });

        return filtered;
    };
});
