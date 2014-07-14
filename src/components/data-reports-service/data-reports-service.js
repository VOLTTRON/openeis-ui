angular.module('openeis-ui.data-reports-service', ['ngResource'])
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
