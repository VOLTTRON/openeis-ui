angular.module('openeis-ui.data-reports.data-reports-service', [])
.service('DataReports', function ($timeout) {
    var DataReports = this,
        reports = [];

    DataReports.query = function () {
        return reports;
    };

    DataReports.create = function(report) {
        report.status = 'pending';
        reports.push(report);
        $timeout(function () {
            report.status = 'complete';
            report.labels = ['X', 'Y'];
            report.data = [
                ['x1', 'y1'],
                ['x2', 'y2'],
                ['x3', 'y3'],
                ['x4', 'y4'],
                ['x5', 'y5'],
                ['x6', 'y6'],
                ['x7', 'y7'],
                ['x8', 'y8'],
                ['x9', 'y9'],
            ];
        }, 10000);
    };
});
