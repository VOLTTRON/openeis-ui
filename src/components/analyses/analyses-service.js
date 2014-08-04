angular.module('openeis-ui.analyses.analyses-service', ['ngResource'])
.service('Analyses', function ($resource) {
    var Analyses = this,
        resource = $resource(settings.API_URL + 'analyses/:analysisId', { analysisId: '@id' }, {
            create: { method: 'POST' },
        });

    Analyses.get = function (analysisId) {
        return resource.get({ analysisId: analysisId });
    };

    Analyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    Analyses.create = function(report) {
        return resource.create(report);
    };
});
