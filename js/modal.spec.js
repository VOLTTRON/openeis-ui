describe('openeis-ui.modal', function () {
    beforeEach(function () {
        module('openeis-ui.modal');
        module('openeis-ui.templates');
    });

    describe('modal directive', function () {
        var directive;

        beforeEach(inject(function($rootScope, $compile) {
            directive = angular.element('<modal><contents></modal>');
            $compile(directive)($rootScope);
            $rootScope.$digest();
        }));

        it('should have a backdrop', function () {
            expect(directive[0].querySelectorAll('.modal__backdrop').length).toBe(1);
        });

        it('should have a dialog', function () {
            expect(directive[0].querySelectorAll('.modal__dialog').length).toBe(1);
        });

        it('should transclude', function () {
            expect(directive[0].querySelectorAll('contents').length).toBe(1);
        });
    });
});
