angular.module('openeis-ui.projects-service', ['ngResource'])
.service('Projects', function ($resource) {
    var Projects = this,
        resource = $resource(settings.API_URL + 'projects/:projectId', { projectId: '@id' }, {
            create: { method: 'POST' },
            save: { method: 'PUT' },
            clone: { method: 'POST', url: settings.API_URL + 'projects/:projectId/clone' }
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

    Projects.clone = function (projectId, cloneName) {
        return resource.clone({ projectId: projectId }, { name: cloneName }).$promise;
    };
});
