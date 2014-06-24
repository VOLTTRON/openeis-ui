describe('openeis-ui.auth', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.auth');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('authRoute provider', function () {
        var authRouteProvider, $route;

        beforeEach(function () {
            module(function (_authRouteProvider_) {
                authRouteProvider = _authRouteProvider_;
            });

            inject(function (_$route_) {
                $route = _$route_;
            });
        });

        describe('whenAnon method', function () {
            it('should add an anon resolve', function () {
                expect($route.routes['/anon-test']).not.toBeDefined();

                authRouteProvider.whenAnon('/anon-test', {});
                expect($route.routes['/anon-test'].resolve.anon).toBeDefined();
            });

            it('should be chainable', function () {
                expect($route.routes['/anon-test']).not.toBeDefined();
                expect($route.routes['/anon-test-2']).not.toBeDefined();
                expect($route.routes['/auth-test']).not.toBeDefined();

                authRouteProvider
                    .whenAnon('/anon-test', {})
                    .whenAnon('/anon-test-2', {})
                    .whenAuth('/auth-test', {});
                expect($route.routes['/anon-test']).toBeDefined();
                expect($route.routes['/anon-test-2']).toBeDefined();
                expect($route.routes['/auth-test']).toBeDefined();
            });
        });

         describe('whenAuth method', function () {
            it('should add an auth resolve', function () {
                expect($route.routes['/auth-test']).not.toBeDefined();

                authRouteProvider.whenAuth('/auth-test', {});
                expect($route.routes['/auth-test'].resolve.auth).toBeDefined();
            });

            it('should be chainable', function () {
                expect($route.routes['/auth-test']).not.toBeDefined();
                expect($route.routes['/auth-test-2']).not.toBeDefined();
                expect($route.routes['/anon-test']).not.toBeDefined();

                authRouteProvider
                    .whenAuth('/auth-test', {})
                    .whenAuth('/auth-test-2', {})
                    .whenAnon('/anon-test', {});
                expect($route.routes['/auth-test']).toBeDefined();
                expect($route.routes['/auth-test-2']).toBeDefined();
                expect($route.routes['/anon-test']).toBeDefined();
            });
        });
    });

    describe('authRoute service', function () {
        var authRoute, $httpBackend, $location, account;

        beforeEach(function () {
            Auth = {
                account: jasmine.createSpy().andCallFake(function () {
                    return { then: function (callback) { callback(account); } };
                }),
            };

            inject(function (_authRoute_, _$httpBackend_, _$location_) {
                authRoute = _authRoute_;
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            });
        });

        describe('requireAnon method', function () {
            var ANONYMOUS_PAGE = '/path/to/anonymous/page';

            it('should redirect authenticated users to AUTH_HOME', function () {
                $location.url(ANONYMOUS_PAGE);
                expect($location.url()).toEqual(ANONYMOUS_PAGE);
                expect(Auth.account).not.toHaveBeenCalled();

                account = true;
                authRoute.requireAnon();
                expect(Auth.account).toHaveBeenCalled();
                expect($location.url()).toEqual(settings.AUTH_HOME);
            });

            it('should not redirect anonymous users', function () {
                $location.url(ANONYMOUS_PAGE);
                expect($location.url()).toEqual(ANONYMOUS_PAGE);
                expect(Auth.account).not.toHaveBeenCalled();

                account = false;
                authRoute.requireAnon();
                expect(Auth.account).toHaveBeenCalled();
                expect($location.url()).toEqual(ANONYMOUS_PAGE);
            });
        });

        describe('requireAuth method', function () {
            var RESTRICTED_PAGE = '/path/to/restricted/page';

            it('should call Auth.loginRedirect and redirect anonymous users to LOGIN_PAGE', function () {
                Auth.loginRedirect = jasmine.createSpy('loginRedirect');

                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);
                expect(Auth.account).not.toHaveBeenCalled();

                account = false;
                authRoute.requireAuth();
                expect(Auth.account).toHaveBeenCalled();
                expect(Auth.loginRedirect).toHaveBeenCalledWith(RESTRICTED_PAGE);
                expect($location.url()).toEqual(settings.LOGIN_PAGE);
            });

            it('should not redirect authenticated users', function () {
                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);
                expect(Auth.account).not.toHaveBeenCalled();

                account = true;
                authRoute.requireAuth();
                expect(Auth.account).toHaveBeenCalled();
                expect($location.url()).toEqual(RESTRICTED_PAGE);
            });
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

    describe('SigUpCtrl controller', function () {
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

    describe('RecoveryCtrl controller', function () {
        var $controller, controller, scope, resolve, reject;

        beforeEach(function () {
            Auth.accountRecover1 = function () {
                return {
                    then: function (successCallback, errorCallback) {
                        resolve = successCallback;
                        reject = errorCallback;
                    },
                };
            };

            Auth.accountRecover2 = function () {
                return {
                    then: function (successCallback, errorCallback) {
                        resolve = successCallback;
                        reject = errorCallback;
                    },
                };
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

    describe('TopBarCtrl controller', function () {
        var controller, scope, accountResponse;

        beforeEach(function () {
            Auth = {
                account: function () {
                    return { then: function (callback) {
                        callback(accountResponse);
                    }};
                },
                logOut: jasmine.createSpy(),
            };

            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('TopBarCtrl', { $scope: scope });
            });
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
