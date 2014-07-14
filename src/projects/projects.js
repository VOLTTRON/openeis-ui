angular.module('openeis-ui.projects', [
    'openeis-ui.auth-route-service',
    'openeis-ui.projects-service',
    'openeis-ui.projects.projects-controller',
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
        });
});
