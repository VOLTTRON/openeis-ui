angular.module('openeis-ui.api', ['ngResource'])
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
.service('Applications', function ($resource) {
    var Applications = this,
        resource = $resource(settings.API_URL + 'applications');

    Applications.query = function () {
        return resource.query();
    };
})
.service('DataReports', function(){
    var DataReports = this;
    var ReportStatus = [{"name": "p1", "status": "Queued"}, {"name":"p2","status": "Running"}, {"name":"p3","status":"Completed"}];
    DataReports.query = function () {
        return ReportStatus;
    };
    DataReports.create = function(status){
        ReportStatus.push(status);
    }
});

