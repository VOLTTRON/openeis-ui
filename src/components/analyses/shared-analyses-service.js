angular.module('openeis-ui.analyses.shared-analyses-service', ['ngResource'])
.service('SharedAnalyses', function ($resource, $q) {
    var SharedAnalyses = this,
        resource = $resource(settings.API_URL + 'shared-analyses/:id', { id: '@analysis' }, {
            // Don't append ID to URL for POST requests
            create: { method: 'POST', url: settings.API_URL + 'shared-analyses' },
        });

    SharedAnalyses.get = function (analysisId) {
        return resource.get({ id: analysisId });
    };

    SharedAnalyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    SharedAnalyses.create = function(analysisId) {
        return resource.create({ analysis: analysisId });
    };
});
