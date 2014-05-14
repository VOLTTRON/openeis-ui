angular.module('openeis-ui.modal', [])
.directive('modal', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'partials/modal.html',
    };
});
