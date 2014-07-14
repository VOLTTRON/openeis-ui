describe('openeis-ui.signup', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.signup');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('SignUpCtrl controller', function () {
        var controller, scope, createResolve, createReject, logInStatus;

        beforeEach(function () {
            Auth = {
                accountCreate: function () {
                    return { then: function (successCallback, errorCallback) {
                        createResolve = successCallback;
                        createReject = errorCallback;
                    }};
                },
                logIn: function () {
                    return { catch: function (callback) {
                        callback({ status: logInStatus });
                    }};
                },
            };

            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('SignUpCtrl', { $scope: scope });
            });
        });

        describe('submit method', function () {
            it('should check for matching passwords', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'differentpassword',
                };
                expect(scope.form.passwordConfirm).not.toBeDefined();

                scope.submit();
                expect(scope.form.passwordConfirm).toBeTruthy();
            });

            it('should pass Auth.accountCreate error status to view', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                createReject({ status: 403 });
                expect(scope.form.error.status).toBe(403);

                scope.submit();
                createReject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });

            it('should flatten validation errors', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                createReject({
                    status: 400,
                    data: {
                        field1: ['error1', 'error2'],
                        field2: 'error1',
                    },
                });
                expect(scope.form.error.status).toBe(400);
                expect(scope.form.error.data.field1).toBe('error1<br>error2');
                expect(scope.form.error.data.field2).toBe('error1');
            });

            it('should log in on successful account creation', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                spyOn(Auth, 'logIn').andCallThrough();
                expect(Auth.logIn).not.toHaveBeenCalled();

                scope.submit();
                createResolve();
                expect(Auth.logIn).toHaveBeenCalled();
            });

            it('should not log in on failed account creation', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                spyOn(Auth, 'logIn').andCallThrough();
                scope.submit();
                createReject({ status: 500 });
                expect(Auth.logIn).not.toHaveBeenCalled();
            });

            it('should pass Auth.logIn error status to view', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                logInStatus = 403;
                scope.submit();
                createResolve();
                expect(scope.form.error).toBe(403);

                logInStatus = 500;
                scope.submit();
                createResolve();
                expect(scope.form.error).toBe(500);
            });
        });

        describe('clearError method', function () {
            it('should clear errors', function () {
                scope.form.error = 'error';
                scope.clearError();
                expect(scope.form.error).toBeFalsy();
            });
        });
    });
});
