describe('openeis-ui.login', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.login');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('LoginCtrl controller', function () {
        var controller, scope, status;

        beforeEach(function () {
            Auth = {
                logIn: function () {
                    return { catch: function (callback) {
                        callback({ status: status });
                    }};
                },
            };

            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('LoginCtrl', { $scope: scope });
            });
        });

        describe('logIn method', function () {
            it('should pass error status to view', function () {
                scope.form = {
                    username: 'TestUser',
                    password: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                status = 403;
                scope.logIn();
                expect(scope.form.error).toBe(403);

                status = 500;
                scope.logIn();
                expect(scope.form.error).toBe(500);
            });
        });

        describe('clearError method', function () {
            it('should clear errors', function () {
                scope.form = {
                    error: 'error',
                };

                scope.clearError();
                expect(scope.form.error).toBeFalsy();
            });
        });
    });
});
