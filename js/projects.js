angular.module('openeis-ui.projects', [
    'openeis-ui.api', 'openeis-ui.auth', 'openeis-ui.file', 'openeis-ui.modal',
    'openeis-ui.sensor-map', 'ngResource', 'angularFileUpload',
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
                sensorMaps: ['sensorMaps', '$route', function(sensorMaps, $route) {
                    return sensorMaps.query($route.current.params.projectId).$promise;
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
.controller('ProjectCtrl', function ($scope, project, dataFiles, Files, sensorMaps, $upload) {
    $scope.modal = {};
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = [];
    $scope.sensorMaps = sensorMaps;

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

    $scope.closeSensorMapModal = function () {
        $scope.newSensorMapModal = false;
    };

    $scope.deleteSensorMap = function ($index) {
        $scope.sensorMaps[$index].$delete(function () {
            $scope.sensorMaps.splice($index, 1);
        });
    };
});
