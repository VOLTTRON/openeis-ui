angular.module('openeis-ui.analyses.analyses-service', ['ngResource'])
.service('Analyses', function ($resource, $q) {
    var Analyses = this,
        resource = $resource(settings.API_URL + 'analyses/:analysisId', { analysisId: '@id' }, {
            create: { method: 'POST' },
        }),
        dataResource = $resource(settings.API_URL + 'analyses/:analysisId/data');

    Analyses.get = function (analysisId) {
        return resource.get({ analysisId: analysisId });
    };

    Analyses.query = function (projectId) {
        return resource.query({ project: projectId });
    };

    Analyses.create = function(report) {
        return resource.create(report);
    };

    Analyses.getData = function (analysisId) {
        return dataResource.get({ analysisId: analysisId }).$promise.then(function (outputs) {
            outputData = {};
            dataPromises = [];

            angular.forEach(outputs, function (output, name) {
                if (name === '$promise' || name === '$resolved') { return; }
                dataPromises.push(dataResource.query({ analysisId: analysisId, output: name }).$promise.then(function (data) {
                    outputData[name] = data;
                }));
            });

            return $q.all(dataPromises).then(function () {
                return outputData;
            });
        });
    };
});
