angular.module('openeis-ui.analyses.shared-analyses-service', ['ngResource'])
.service('SharedAnalyses', function ($resource, $q) {
    var SharedAnalyses = this,
        resource = $resource(settings.API_URL + 'shared-analyses/:analysisId', { analysisId: '@analysis' });

    SharedAnalyses.get = function (analysisId) {
        return resource.get({ analysisId: analysisId });
    };

    SharedAnalyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    SharedAnalyses.create = function(analysisId) {
        // Don't append ID to URL
        return resource.save({ analysisId: null }, { analysis: analysisId });
    };
});
