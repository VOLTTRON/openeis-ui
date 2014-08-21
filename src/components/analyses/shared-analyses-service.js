angular.module('openeis-ui.analyses.shared-analyses-service', ['ngResource'])
.service('SharedAnalyses', function ($resource, $q) {
    var SharedAnalyses = this,
        resource = $resource(settings.API_URL + 'shared-analyses/:analysisId', { analysisId: '@analysis' }),
        dataResource = $resource(settings.API_URL + 'shared-analyses/:analysisId/data');

    SharedAnalyses.get = function (analysisId, key) {
        return resource.get({ analysisId: analysisId, key: key });
    };

    SharedAnalyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    SharedAnalyses.create = function(analysisId) {
        // Don't append ID to URL
        return resource.save({ analysisId: null }, { analysis: analysisId });
    };

    SharedAnalyses.getData = function (analysisId, key) {
        return dataResource.get({ analysisId: analysisId, key: key }).$promise.then(function (outputs) {
            outputData = {};
            dataPromises = [];

            angular.forEach(outputs, function (output, name) {
                if (name === '$promise' || name === '$resolved') { return; }
                dataPromises.push(dataResource.query({ analysisId: analysisId, key: key, output: name }).$promise.then(function (data) {
                    outputData[name] = data;
                }));
            });

            return $q.all(dataPromises).then(function () {
                return outputData;
            });
        });
    };
});
