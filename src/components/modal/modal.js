angular.module('openeis-ui.modal', [])
.directive('modal', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'src/components/modal/modal.tpl.html',
    };
})
.service('Modals', function () {
    var Modals = this,
        openModals = {};

    Modals.openModal = function (modalName) {
        openModals[modalName] = true;
    };

    Modals.closeModal = function (modalName) {
        delete openModals[modalName];
    };

    Modals.modalOpen = function (modalName) {
        if (typeof modalName === 'undefined') {
            return !angular.equals(openModals, {});
        }

        return openModals.hasOwnProperty(modalName);
    };
});
