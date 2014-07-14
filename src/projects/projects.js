angular.module('openeis-ui.projects', [
    'openeis-ui.auth-route',
    'openeis-ui.file-upload',
    'openeis-ui.projects.project-controller',
    'openeis-ui.projects.projects-controller',
    'openeis-ui.projects.projects-service',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/projects', {
            controller: 'ProjectsCtrl',
            templateUrl: 'src/projects/projects.tpl.html',
            resolve: {
                projects: ['Projects', function(Projects) {
                    return Projects.query();
                }]
            },
        })
        .whenAuth('/projects/:projectId', {
            controller: 'ProjectCtrl',
            templateUrl: 'src/projects/project.tpl.html',
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
                dataMaps: ['DataMaps', '$route', function(DataMaps, $route) {
                    return DataMaps.query($route.current.params.projectId).$promise;
                }],
            },
        });
});
