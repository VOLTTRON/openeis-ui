angular.module('openeis-ui.projects', [
    'openeis-ui.api', 'openeis-ui.auth', 'openeis-ui.file', 'openeis-ui.modal',
    'openeis-ui.sensor-container', 'ngResource', 'angularFileUpload',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/projects', {
            controller: 'ProjectsCtrl',
            templateUrl: 'partials/projects.html',
            resolve: {
                projects: ['Projects', function(Projects) {
                    return Projects.query();
                }]
            },
        })
        .whenAuth('/projects/:projectId', {
            controller: 'ProjectCtrl',
            templateUrl: 'partials/project.html',
            resolve: {
                project: ['Projects', '$route', function(Projects, $route) {
                    return Projects.get($route.current.params.projectId);
                }],
                dataFiles: ['Files', '$route', function(Files, $route) {
                    return Files.query($route.current.params.projectId);
                }],
                dataSets: ['DataSets', '$route', function(DataSets, $route) {
                    return DataSets.query($route.current.params.projectId).$promise;
                }],
                sensorMaps: ['SensorMaps', '$route', function(SensorMaps, $route) {
                    return SensorMaps.query($route.current.params.projectId).$promise;
                }],
            },
        });
})
.controller('ProjectsCtrl', function ($scope, projects, Projects) {
    $scope.projects = projects;

    $scope.newProject = {
        name: '',
        create: function () {
            Projects.create({ name: $scope.newProject.name }).then(function (response) {
                $scope.newProject.name = '';
                $scope.projects.push(response);
            });
        },
    };

    $scope.renameProject = function ($index) {
        var newName = prompt("New project name:");

        if (!newName || !newName.length) {
            return;
        }

        $scope.projects[$index].name = newName;
        $scope.projects[$index].$save(function (response) {
            $scope.projects[$index] = response;
        });
    };

    $scope.deleteProject = function ($index) {
        $scope.projects[$index].$delete(function () {
            $scope.projects.splice($index, 1);
        });
    };
})
.controller('ProjectCtrl', function ($scope, project, dataFiles, Files, dataSets, DataSets, sensorMaps, $upload, $timeout) {
    $scope.modal = {};
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = dataSets;
    $scope.sensorMaps = sensorMaps;

    var statusCheckPromise;

    $scope.statusCheck = function () {
        angular.forEach(dataSets, function (dataSet) {
            if (!dataSets.status || dataSets.status !== 'Complete') {
                DataSets.getStatus(dataSet).then(function (response) {
                    dataSet.status = response.data;

                    if (response.data !== 'Complete') {
                        $timeout.cancel(statusCheckPromise);
                        statusCheckPromise = $timeout($scope.statusCheck, 5000);
                    }
                });
            }
        });
    };

    $scope.statusCheck();

    function openFileModal(file) {
        Files.head(file.id).then(function (headResponse) {
            if (headResponse.data.has_header) {
                headResponse.data.header = headResponse.data.rows.shift();
            }

            file.head = headResponse.data;
            file.cols = [];
            angular.forEach(file.head.rows[0], function (v, k) {
                file.cols.push(k);
            });

            $scope.modal.File = file;
        });
    }

    $scope.viewFile = function ($index) {
        openFileModal($scope.dataFiles[$index]);
    };

    $scope.upload = function (fileInput) {
        angular.forEach(fileInput[0].files, function(file) {
            $upload.upload({
                url: settings.API_URL + 'projects/' + project.id + '/add_file',
                file: file,
            }).then(function (response) {
                // Perform a 'get' so that the file object has $save and $delete methods
                Files.get(response.data.id).then(function (getResponse) {
                    openFileModal(getResponse);
                    $scope.dataFiles.push(getResponse);
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

    $scope.closeNewDataSetModal = function () {
        $scope.newDataSetModal = false;
    };

    $scope.deleteDataSet = function ($index) {
        $scope.dataSets[$index].$delete(function () {
            $scope.dataSets.splice($index, 1);
        });
    };

    $scope.closeNewSensorMapModal = function () {
        $scope.newSensorMapModal = false;
    };

    $scope.deleteSensorMap = function ($index) {
        $scope.sensorMaps[$index].$delete(function () {
            $scope.sensorMaps.splice($index, 1);
        });
    };
})
.controller('NewDataSetCtrl', function ($scope, DataSets, SensorMaps) {
    SensorMaps.ensureFileMetaData($scope.dataFiles);

    angular.forEach($scope.sensorMaps, function (sensorMap) {
        if (!angular.isObject(sensorMap.map)) {
            sensorMap.map = angular.fromJson(sensorMap.map.replace(/'/g, '"').replace(/None/g, 'null'));
        }
    });

    $scope.newDataMap = { files: {} };

    $scope.filesWithSignature = function (key) {
        var files = [];

        angular.forEach($scope.dataFiles, function (file) {
            if (angular.equals(file.signature, $scope.newDataMap.map.map.files[key].signature)) {
                files.push(file);
            }
        });

        return files;
    };

    $scope.save = function () {
        var files = [];

        angular.forEach($scope.newDataMap.files, function (fileId, key) {
            files.push({ name: key, file: fileId });
        });

        DataSets.create({
            map: $scope.newDataMap.map.id,
            files: files,
        }).$promise.then(function (dataSet) {
            $scope.dataSets.push(dataSet);
            $scope.statusCheck();
            $scope.closeNewDataSetModal();
        }, function (rejection) {
            alert(angular.toJson(rejection, true));
        });
    };
})
.controller('NewSensorMapCtrl', function ($scope, SensorMaps) {
    SensorMaps.ensureFileMetaData($scope.dataFiles);

    $scope.newSensorMap = {
        project: $scope.project.id,
        map: {
            version: 1,
            files: {},
            sensors: [],
        },
        valid: false,
    };

    $scope.$watch('newSensorMap.map', function () {
        SensorMaps.validateMap($scope.newSensorMap.map)
            .then(function (result) {
                $scope.newSensorMap.valid = result.valid;
            });
    }, true);

    $scope.save = function () {
        SensorMaps.create($scope.newSensorMap).$promise.then(function (sensorMap) {
            $scope.sensorMaps.push(sensorMap);
            $scope.closeNewSensorMapModal();
        }, function (rejection) {
            alert(rejection.data.__all__.join('\n'));
        });
    };

    $scope.newChild = {};

    $scope.addChild = function () {
        $scope.newChild.name = $scope.newChild.name.replace('/', '-');
        $scope.newSensorMap.map.sensors.unshift(angular.copy($scope.newChild));
        $scope.newChild = {};
    };
});
