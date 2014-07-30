angular.module('openeis-ui.analyses.analyses-service', ['ngResource'])
.service('Analyses', function ($resource) {
    var Analyses = this,
        resource = $resource(settings.API_URL + 'analyses/:analysisId', { analysisId: '@id' }, {
            create: { method: 'POST' },
        });

    Analyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    Analyses.create = function(report) {
        return resource.create(report);
    };
});
