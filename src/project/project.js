angular.module('openeis-ui.project', [
    'openeis-ui.auth-route-service',
    'openeis-ui.file-upload-directive',
    'openeis-ui.filters',
    'openeis-ui.data-reports',
    'openeis-ui.projects-service',
    'openeis-ui.data-files',
    'openeis-ui.data-maps',
    'openeis-ui.data-sets-service',
    'openeis-ui.project.configure-timestamp-controller',
    'openeis-ui.project.new-data-map-controller',
    'openeis-ui.project.new-data-report-controller',
    'openeis-ui.project.new-data-set-controller',
    'openeis-ui.project.project-controller',
])
.config(function (authRouteProvider) {
    authRouteProvider
        .whenAuth('/projects/:projectId', {
            controller: 'ProjectCtrl',
            templateUrl: 'src/project/project.tpl.html',
            resolve: {
                project: ['Projects', '$route', function(Projects, $route) {
                    return Projects.get($route.current.params.projectId);
                }],
                dataFiles: ['DataFiles', '$route', function(DataFiles, $route) {
                    return DataFiles.query($route.current.params.projectId);
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
