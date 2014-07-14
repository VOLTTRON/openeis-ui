describe('openeis-ui.account', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.account');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('AccountCtrl controller', function () {
        var $controller, controller, scope, accountResponse;

        beforeEach(function () {
            Auth = {
                account: function () {
                    return { then: function (callback) {
                        callback(accountResponse);
                    }};
                },
            };

            inject(function ($rootScope, _$controller_) {
                $controller = _$controller_;
                scope = $rootScope.$new();
                controller = $controller('AccountCtrl', { $scope: scope });
            });
        });

        it('should retrieve account', function () {
            accountResponse = {};
            controller = $controller('AccountCtrl', { $scope: scope });
            expect(scope.account).toBe(accountResponse);
        });

        it('should detect profile name changes', function () {
            accountResponse = { first_name: 'TestName' };
            controller = $controller('AccountCtrl', { $scope: scope });
            scope.$digest();
            expect(scope.profile.changed).toBe(false);

            scope.account.first_name = 'NewName';
            scope.$digest();
            expect(scope.profile.changed).toBe(true);

            scope.account.first_name = 'TestName';
            scope.$digest();
            expect(scope.profile.changed).toBe(false);
        });

        it('should detect profile email changes', function () {
            accountResponse = { email: 'TestEmail' };
            controller = $controller('AccountCtrl', { $scope: scope });
            scope.$digest();
            expect(scope.profile.changed).toBe(false);

            scope.account.email = 'NewEmail';
            scope.$digest();
            expect(scope.profile.changed).toBe(true);

            scope.account.email = 'TestEmail';
            scope.$digest();
            expect(scope.profile.changed).toBe(false);
        });

        describe('profile update method', function () {
            var resolve, reject;

            beforeEach(function () {
                Auth.accountUpdate = function () {
                    return { then: function (successCallback, errorCallback) {
                        resolve = successCallback;
                        reject = errorCallback;
                    }};
                };
            });

            it('should clear alerts and call Auth.accountUpdate', function () {
                spyOn(scope.profile, 'clearAlerts').andCallThrough();
                spyOn(Auth, 'accountUpdate').andCallThrough();
                expect(scope.profile.clearAlerts).not.toHaveBeenCalled();
                expect(Auth.accountUpdate).not.toHaveBeenCalled();

                scope.profile.update();
                expect(scope.profile.clearAlerts).toHaveBeenCalled();
                expect(Auth.accountUpdate).toHaveBeenCalled();
            });

            it('should update accountOrig on successful update', function () {
                accountResponse = {
                    first_name: 'TestName',
                    email: 'TestEmail',
                };
                controller = $controller('AccountCtrl', { $scope: scope });
                scope.$digest();
                expect(scope.account).toBe(accountResponse);
                expect(scope.profile.changed).toBe(false);

                scope.account.first_name = 'NewName';
                scope.account.email = 'NewEmail';
                scope.$digest();
                expect(scope.profile.changed).toBe(true);

                scope.profile.update();
                resolve();

                scope.account.first_name = 'NewName2';
                scope.account.email = 'NewEmail2';
                scope.$digest();
                expect(scope.profile.changed).toBe(true);

                scope.account.first_name = 'NewName';
                scope.account.email = 'NewEmail';
                scope.$digest();
                expect(scope.profile.changed).toBe(false);
            });

            it('should pass error to view on failed update', function () {
                var rejection = { status: 500 };
                expect(scope.profile.error).not.toBeDefined();

                scope.profile.update();
                reject(rejection);
                expect(scope.profile.error).toBe(rejection);
            });

            it('should flatten validation errors', function () {
                var rejection = {
                    status: 400,
                    data: {
                        field1: ['error1', 'error2'],
                        field2: 'error1',
                    },
                };
                expect(scope.profile.error).not.toBeDefined();

                scope.profile.update();
                reject(rejection);
                expect(scope.profile.error.status).toBe(rejection.status);
                expect(scope.profile.error.data.field1).toBe('error1<br>error2');
                expect(scope.profile.error.data.field2).toBe('error1');
            });
        });

        describe('password update method', function () {
            var resolve, reject;

            beforeEach(function () {
                Auth.accountPassword = function () {
                    return { then: function (successCallback, errorCallback) {
                        resolve = successCallback;
                        reject = errorCallback;
                    }};
                };
            });

            it('should clear alerts and call Auth.accountPassword', function () {
                spyOn(scope.password, 'clearAlerts').andCallThrough();
                spyOn(Auth, 'accountPassword').andCallThrough();
                expect(scope.password.clearAlerts).not.toHaveBeenCalled();
                expect(Auth.accountPassword).not.toHaveBeenCalled();

                scope.password.update();
                expect(scope.password.clearAlerts).toHaveBeenCalled();
                expect(Auth.accountPassword).toHaveBeenCalled();
            });

            it('should check for matching passwords', function () {
                scope.password.new = 'password';
                scope.password.newConfirm = 'password';
                expect(scope.password.mismatch).not.toBeDefined();

                scope.password.update();
                expect(scope.password.mismatch).toBe(false);

                scope.password.newConfirm = 'differentpassword';
                scope.password.update();
                expect(scope.password.mismatch).toBe(true);
            });

            it('should clear values on successful update', function () {
                scope.password.current = 'currentpassword';
                scope.password.new = 'newpassword';
                scope.password.newConfirm = 'newpassword';

                scope.password.update();
                resolve();

                expect(scope.password.current).toBe('');
                expect(scope.password.new).toBe('');
                expect(scope.password.newConfirm).toBe('');
            });

            it('should pass error to view on failed update', function () {
                var rejection = { status: 500 };
                expect(scope.password.error).not.toBeDefined();

                scope.password.update();
                reject(rejection);
                expect(scope.password.error).toBe(rejection);
            });

            it('should flatten validation errors', function () {
                var rejection = {
                    status: 400,
                    data: {
                        field1: ['error1', 'error2'],
                        field2: 'error1',
                    },
                };
                expect(scope.password.error).not.toBeDefined();

                scope.password.update();
                reject(rejection);
                expect(scope.password.error.status).toBe(rejection.status);
                expect(scope.password.error.data.field1).toBe('error1<br>error2');
                expect(scope.password.error.data.field2).toBe('error1');
            });
        });
    });
});
