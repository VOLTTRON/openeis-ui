describe('openeis-ui', function () {
    beforeEach(function () {
        module('openeis-ui');
    });

    describe('AppCtrl', function () {
        var AppCtrl, scope;

        it('should allow view to check for open modals', inject(function ($rootScope, $controller, Modals) {
            scope = $rootScope.$new();
            AppCtrl = $controller('AppCtrl', { $scope: scope });

            expect(scope.modalOpen).toBe(Modals.modalOpen);
        }));
    });
});
