angular.module('openeis-ui.project.project-controller', [
    'angularFileUpload',
    'openeis-ui.data-files',
    'openeis-ui.analyses',
    'openeis-ui.data-sets-service',
    'openeis-ui.modals'
])
.controller('ProjectCtrl', function ($scope, project, dataFiles, DataFiles, dataSets, DataSets, dataMaps, $upload, $timeout, $q, Modals, analyses, Analyses) {
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = dataSets;
    $scope.dataMaps = dataMaps;
    $scope.Modals = Modals;
    $scope.analyses = analyses;

    $scope.add = function(){
        Analyses.create({"name": "Run1", "status":"Error"});
    };
    var statusCheckPromise;

    $scope.statusCheck = function () {
        angular.forEach($scope.dataSets, function (dataSet) {
            if (!dataSet.status || dataSet.status.status !== 'complete') {
                var promises = [];

                promises.push(DataSets.getStatus(dataSet).then(function (response) {
                    dataSet.status = response.data;

                    if (dataSet.status.status === 'processing') {
                        dataSet.status.status += ' - ' + Math.floor(parseFloat(dataSet.status.percent)) + '%';
                    }
                }));

                promises.push(DataSets.getErrors(dataSet).then(function (response) {
                    dataSet.errors = response.data;
                }));

                $q.all(promises).then(function () {
                    if (dataSet.status.status !== 'complete') {
                        $timeout.cancel(statusCheckPromise);
                        statusCheckPromise = $timeout($scope.statusCheck, 1000);
                    }
                });
            }
        });

        angular.forEach($scope.analyses, function (analysis) {
            if (analysis.status !== 'complete' && analysis.status !== 'error') {
                Analyses.get(analysis.id).$promise.then(function (updatedAnalysis) {
                    angular.extend(analysis, updatedAnalysis);

                    if (analysis.status !== 'complete' && analysis.status !== 'error') {
                        $timeout.cancel(statusCheckPromise);
                        statusCheckPromise = $timeout($scope.statusCheck, 1000);
                    }
                });
            }
        });
    };

    $scope.statusCheck();

    $scope.configureTimestamp = function ($index) {
        DataFiles.head($scope.dataFiles[$index].id).then(function (headResponse) {
            if (headResponse.data.has_header) {
                headResponse.data.header = headResponse.data.rows.shift();
            }

            $scope.dataFiles[$index].head = headResponse.data;
            $scope.dataFiles[$index].cols = [];
            angular.forEach($scope.dataFiles[$index].head.rows[0], function (v, k) {
                $scope.dataFiles[$index].cols.push(k);
            });

            $scope.timestampFile = $scope.dataFiles[$index];
            Modals.openModal('configureTimestamp');
        });
    };

    $scope.upload = function (fileInput) {
        angular.forEach(fileInput[0].files, function(file) {
            $upload.upload({
                url: settings.API_URL + 'projects/' + project.id + '/add_file',
                file: file,
            }).then(function (response) {
                // Perform a 'get' so that the file object has $save and $delete methods
                DataFiles.get(response.data.id).then(function (getResponse) {
                    $scope.dataFiles.push(getResponse);
                    $scope.configureTimestamp($scope.dataFiles.length - 1);
                });

                fileInput.val('').triggerHandler('change');
            });
        });
    };

    $scope.deleteFile = function ($index) {
        $scope.dataFiles[$index].$delete(function () {
            $scope.dataFiles.splice($index, 1);
        });
    };

    $scope.errorsModal = {};

    $scope.showErrors = function (dataSet) {
        $scope.errorsModal.files = {};

        // Create hash of data map file names to data file names
        angular.forEach(dataSet.files, function (file) {
            angular.forEach($scope.dataFiles, function (dataFile) {
                if (dataFile.id === file.file) {
                    $scope.errorsModal.files[file.name] = dataFile.file;
                }
            });

            if (!$scope.errorsModal.files[file.name]) {
                $scope.errorsModal.files[file.name] = 'File "' + file.name + '"';
            }
        });

        $scope.errorsModal.errors = dataSet.errors;
    };

    $scope.deleteDataSet = function ($index) {
        $scope.dataSets[$index].$delete(function () {
            $scope.dataSets.splice($index, 1);
        });
    };

    $scope.deleteDataMap = function ($index) {
        $scope.dataMaps[$index].$delete(function () {
            $scope.dataMaps.splice($index, 1);
        });
    };

    $scope.viewAnalysis = function (index) {
        $scope.analysis = Analyses.query()[index];
        Modals.openModal('analysis');
    };
});
