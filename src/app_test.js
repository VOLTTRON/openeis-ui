describe('openeis-ui', function () {
    beforeEach(function () {
        module('openeis-ui');
    });

    describe('AppCtrl', function () {
        var Auth, Modals, AppCtrl, scope, accountResponse;

        beforeEach(inject(function ($rootScope, $controller) {
            Auth = {
                account: function () {
                    return { then: function (callback) {
                        callback(accountResponse);
                    }};
                },
                logOut: jasmine.createSpy(),
            };

            Modals = { modalOpen: null };

            scope = $rootScope.$new();
            AppCtrl = $controller('AppCtrl', { $scope: scope, Auth: Auth, Modals: Modals });
        }));

        it('should allow view to check for open modals', function () {
            expect(scope.modalOpen).toBe(Modals.modalOpen);
        });

        it('should listen for account changes', function () {
            spyOn(Auth, 'account').andCallThrough();
            expect(Auth.account).not.toHaveBeenCalled();
            expect(scope.account).not.toBeDefined();

            accountResponse = 'account';
            scope.$emit('accountChange');
            expect(Auth.account.callCount).toBe(1);
            expect(scope.account).toBe('account');

            accountResponse = 'account2';
            scope.$emit('accountChange');
            expect(Auth.account.callCount).toBe(2);
            expect(scope.account).toBe('account2');
        });

        it('should allow logging out', function () {
            expect(Auth.logOut).not.toHaveBeenCalled();

            scope.logOut();
            expect(Auth.logOut).toHaveBeenCalled();
        });
    });
});
