angular.module('openeis-ui.applications-service', ['ngResource'])
.service('Applications', function ($resource) {
    var Applications = this,
        resource = $resource(settings.API_URL + 'applications');

    Applications.query = function () {
        return resource.query();
    };
});

