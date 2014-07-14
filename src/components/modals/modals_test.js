describe('openeis-ui.modals', function () {
    beforeEach(function () {
        module('openeis-ui.modals');
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

    describe('Modals service', function () {
        var Modals;

        beforeEach(inject(function (_Modals_) {
            Modals = _Modals_;
        }));

        it('should open and close modals', function () {
             expect(Modals.modalOpen()).toBe(false);

             Modals.openModal('modal');

             expect(Modals.modalOpen('modal')).toBe(true);
             expect(Modals.modalOpen()).toBe(true);

             Modals.openModal('modal2');

             expect(Modals.modalOpen('modal2')).toBe(true);
             expect(Modals.modalOpen()).toBe(true);

             Modals.closeModal('modal');

             expect(Modals.modalOpen('modal')).toBe(false);
             expect(Modals.modalOpen()).toBe(true);

             Modals.closeModal('modal2');

             expect(Modals.modalOpen('modal2')).toBe(false);
             expect(Modals.modalOpen()).toBe(false);
        });
    });
});
