describe('openeis-ui.recovery', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.recovery');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('RecoveryCtrl controller', function () {
        var $controller, controller, scope, resolve, reject;

        beforeEach(function () {
            Auth = {
                accountRecover1: function () {
                    return {
                        then: function (successCallback, errorCallback) {
                            resolve = successCallback;
                            reject = errorCallback;
                        },
                    };
                },
                accountRecover2: function () {
                    return {
                        then: function (successCallback, errorCallback) {
                            resolve = successCallback;
                            reject = errorCallback;
                        },
                    };
                },
            };

            inject(function ($rootScope, _$controller_) {
                scope = $rootScope.$new();
                $controller = _$controller_;
            });
        });

        it('should default to stage 1', function () {
            controller = $controller('RecoveryCtrl', { $scope: scope });
            expect(scope.form.stage).toBe(1);
        });

        it('should go to stage 2 if username and code are provided', function () {
            routeParams = {
                username: 'TestUser',
                code: 'testcode',
            };
            controller = $controller('RecoveryCtrl', { $scope: scope, $routeParams: routeParams });
            expect(scope.form.stage).toBe(2);
            expect(scope.recovery).toEqual({
                username: routeParams.username,
                code: routeParams.code,
            });
        });

        describe('submit method stage 1', function () {
            beforeEach(function () {
                controller = $controller('RecoveryCtrl', { $scope: scope });
            });

            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();
                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });
                expect(scope.form.error.status).toBe(404);

                scope.submit();
                reject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });
        });

        describe('submit method stage 2', function () {
            beforeEach(function () {
                controller = $controller('RecoveryCtrl', { $scope: scope });
                scope.form.stage = 2;
            });

            it('should detect non-matching passwords', function () {
                scope.recovery = {
                    password: 'password',
                    passwordConfirm: 'differentpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                expect(scope.form.error.status).toBe(400);
            });

            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();
                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });
                expect(scope.form.error.status).toBe(404);

                scope.submit();
                reject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });
        });
    });
});
