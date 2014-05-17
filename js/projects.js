angular.module('openeis-ui.projects', [
    'openeis-ui.api', 'openeis-ui.auth', 'openeis-ui.file', 'openeis-ui.modal',
    'ngResource', 'angularFileUpload',
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
.controller('ProjectCtrl', function ($scope, project, dataFiles, $upload, Files) {
    $scope.modal = {};
    $scope.project = project;
    $scope.dataFiles = dataFiles;
    $scope.dataSets = [
        { name: 'Data set 1', status: 'Ready' },
        { name: 'Data set 2', status: 'Importing' },
        { name: 'Data set 3', status: 'Queued' },
    ];

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

    $scope.createSensorMap = function () {
        $scope.modal.sensorMap = { version: 1 };

        $scope.modal.sensorMap.files = {
            foofile: {
                signature: { headers: ['foo', 'bar'] },
                timestamp: { columns: ['foo', 'bar'], format: '' },
            },
        };

        $scope.modal.sensorMap.sensors = {
            site1: {
                attributes: {
                    address: {
                        address: '123 Anystreet',
                        city: 'Richland',
                        state: 'WA',
                        zip_code: '99352',
                    },
                },
            },
            'site2/building1': {
                attributes: {
                    address: {
                        address: '321 Anystreet',
                        city: 'Richland',
                        state: 'WA',
                        zip_code: '99352',
                    },
                },
            },
        };
    };
})
.service('SensorMapValidator', function ($http, $q) {
    var Validator = this,
        schema;

    function loadSchema() {
        if (!schema) {
            return $http.get('/static/projects/json/sensormap-schema.json')
                .then(function (response) {
                    schema = response.data;
                    return schema;
                });
        }

        var deferred = $q.defer();
        deferred.resolve(schema);
        return deferred.$promise;
    };

    Validator.validate = function (obj) {
        return loadSchema().then(function (schema) {
            return tv4.validateMultiple(obj, schema);
        });
    };
})
.controller('SensorMapCtrl', function ($scope, SensorMapValidator) {
    SensorMapValidator.validate($scope.modal.sensorMap)
        .then(function (result) {
            if (!result.valid) {
                angular.forEach(result.errors, function (v, k) {
                    result.errors[k].stack = null;
                });
            }

            $scope.modal.result = result;
        });

    $scope.modal.save = function () {
        $scope.modal.sensorMap = null;
    };
});
