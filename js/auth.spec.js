describe('openeis-ui.auth', function () {
    var Auth = {
            account: function () { return {
                then: function () {} };
            },
        };

    beforeEach(function () {
        module('openeis-ui.auth');

        module(function ($provide) {
            $provide.constant('Auth', Auth);
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
            spyOn(Auth, 'account').andCallFake(function () {
                return { then: function (callback) { callback(account); } };
            });

            inject(function (_authRoute_, _$httpBackend_, _$location_) {
                authRoute = _authRoute_;
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            });
        });

        describe('requireAnon method', function () {
            var ANONYMOUS_PAGE = '/path/to/anonymous/page';

            it('should call Auth.authHome if user is logged in', function () {
                account = true;
                Auth.authHome = jasmine.createSpy('Auth.authHome');

                authRoute.requireAnon();

                expect(Auth.account).toHaveBeenCalled();
                expect(Auth.authHome).toHaveBeenCalled();
            });

            it('should not redirect anonymous users', function () {
                account = false;
                Auth.authHome = jasmine.createSpy('Auth.authHome');

                authRoute.requireAnon();

                expect(Auth.account).toHaveBeenCalled();
                expect(Auth.authHome).not.toHaveBeenCalled();
            });
        });

        describe('requireAuth method', function () {
            var RESTRICTED_PAGE = '/path/to/restricted/page';

            it('should call Auth.afterLogin()', function () {
                Auth.afterLogin = jasmine.createSpy('afterLogin');

                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);

                authRoute.requireAuth();

                expect(Auth.afterLogin).toHaveBeenCalledWith(RESTRICTED_PAGE);
            });

            it('should not redirect authenticated users', function () {
                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);

                authRoute.requireAuth();

                expect($location.url()).toEqual(RESTRICTED_PAGE);
            });
        });
    });

    describe('LoginCtrl controller', function () {
        var controller, scope, status;

        beforeEach(function () {
            Auth.logIn = function () {
                return {
                    catch: function (callback) {
                        callback({ status: status });
                    },
                };
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

                expect(scope.form.error).toEqual(403);

                status = 500;
                scope.logIn();

                expect(scope.form.error).toEqual(500);
            });
        });
    });

    describe('RecoveryCtrl controller', function () {
        var controller, scope, resolve, reject;

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

            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('RecoveryCtrl', { $scope: scope });
            });
        });

        it('should default to stage 1', function () {
            expect(scope.form.stage).toEqual(1);
        });

        describe('submit method stage 1', function () {
            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();

                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });

                expect(scope.form.error.status).toEqual(404);

                scope.submit();
                reject({ status: 500 });

                expect(scope.form.error.status).toEqual(500);
            });
        });

        describe('submit method stage 2', function () {
            beforeEach(function () {
                scope.form.stage = 2;
            });

            it('should detect non-matching passwords', function () {
                scope.recovery = {
                    password: 'password',
                    passwordConfirm: 'differentpassword',
                };

                expect(scope.form.error).not.toBeDefined();

                scope.submit();

                expect(scope.form.error.status).toEqual(400);
            });

            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();

                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });

                expect(scope.form.error.status).toEqual(404);

                scope.submit();
                reject({ status: 500 });

                expect(scope.form.error.status).toEqual(500);
            });
        });
    });

    describe('TopBarCtrl controller', function () {
        var controller, scope;

        beforeEach(function () {
            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('TopBarCtrl', { $scope: scope });
            });
        });
    });
});
