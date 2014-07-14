angular.module('openeis-ui.projects.projects-controller', [
    'openeis-ui.projects-service',
])
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
});
