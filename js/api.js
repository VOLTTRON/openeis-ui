angular.module('openeis-ui.api', ['ngResource'])
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

