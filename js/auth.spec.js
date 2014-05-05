describe('openeis-ui.auth', function () {
    var API_URL = '/api',
        LOGIN_PAGE = '/path/to/login/page',
        AUTH_HOME = '/path/to/auth/home';

    beforeEach(function () {
        module('openeis-ui.auth');

        module(function($provide) {
            $provide.constant('API_URL', API_URL);
            $provide.constant('LOGIN_PAGE', LOGIN_PAGE);
            $provide.constant('AUTH_HOME', AUTH_HOME);
        });
    });

    describe('authRoute provider', function () {
        var authRouteProvider;

        beforeEach(module(function ($provide, _authRouteProvider_) {
            $provide.value('Auth', {
                requireAnon: function () {},
                requireAuth: function () {},
            });

            authRouteProvider = _authRouteProvider_;
        }));

        describe('whenAnon method', function () {
            it('should add an anon resolve', function () {
                inject(function (authRoute) {
                    expect(authRoute.routes['/anon-test']).not.toBeDefined();

                    authRouteProvider.whenAnon('/anon-test', {});

                    expect(authRoute.routes['/anon-test'].resolve.anon).toBeDefined();
                });
            });

            it('should be chainable', function () {
                inject(function (authRoute) {
                    expect(authRoute.routes['/anon-test']).not.toBeDefined();
                    expect(authRoute.routes['/anon-test-2']).not.toBeDefined();
                    expect(authRoute.routes['/auth-test']).not.toBeDefined();

                    authRouteProvider
                        .whenAnon('/anon-test', {})
                        .whenAnon('/anon-test-2', {})
                        .whenAuth('/auth-test', {});

                    expect(authRoute.routes['/anon-test']).toBeDefined();
                    expect(authRoute.routes['/anon-test-2']).toBeDefined();
                    expect(authRoute.routes['/auth-test']).toBeDefined();
                });
            });
        });

         describe('whenAuth method', function () {
            it('should add an auth resolve', function () {
                inject(function (authRoute) {
                    expect(authRoute.routes['/auth-test']).not.toBeDefined();

                    authRouteProvider.whenAuth('/auth-test', {});

                    expect(authRoute.routes['/auth-test'].resolve.auth).toBeDefined();
                });
            });

            it('should be chainable', function () {
                inject(function (authRoute) {
                    expect(authRoute.routes['/auth-test']).not.toBeDefined();
                    expect(authRoute.routes['/auth-test-2']).not.toBeDefined();
                    expect(authRoute.routes['/anon-test']).not.toBeDefined();

                    authRouteProvider
                        .whenAuth('/auth-test', {})
                        .whenAuth('/auth-test-2', {})
                        .whenAnon('/anon-test', {});

                    expect(authRoute.routes['/auth-test']).toBeDefined();
                    expect(authRoute.routes['/auth-test-2']).toBeDefined();
                    expect(authRoute.routes['/anon-test']).toBeDefined();
                });
            });
        });
    });

    describe('Auth service', function () {
        var Auth, $httpBackend, $location,
            resourceUrl = API_URL + '/account',
            loginResourceUrl = API_URL + '/account/login',
            resetResourceUrl = API_URL + '/account/password_reset';

        beforeEach(function () {
            inject(function (_Auth_, _$httpBackend_, _$location_) {
                Auth = _Auth_;
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        describe('init method', function () {
            it('should update the account variable', function () {
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.init();

                expect(Auth.account()).toEqual(null);
                $httpBackend.flush();
                expect(Auth.account().username).toEqual('TestUser');

                $httpBackend.expectGET(resourceUrl).respond(403, '');
                Auth.init();

                expect(Auth.account().username).toEqual('TestUser');
                $httpBackend.flush();
                expect(Auth.account()).toEqual(false);
            });
        });

        describe('accountRecover method', function () {
            it('should POST account ID', function () {
                $httpBackend.expectPOST(resetResourceUrl, '{"username_or_email":"TestUser"}').respond(204, '');
                Auth.accountRecover('TestUser');
                $httpBackend.flush();
            });
        });

        describe('logIn method', function () {
            it('should only call the init method if successful', function () {
                spyOn(Auth, 'init').andCallThrough();

                $httpBackend.expectPOST(loginResourceUrl).respond(403, '');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect(Auth.init).not.toHaveBeenCalled();

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect(Auth.init).toHaveBeenCalled();
            });

            it('should redirect to AUTH_HOME if successful', function () {
                $location.url(LOGIN_PAGE);
                expect($location.url()).toEqual(LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(AUTH_HOME);
            });
        });

        describe('logOut method', function () {
            it('should update the username property if successful', function () {
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.init();
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();

                expect(Auth.account().username).toEqual('TestUser');
                $httpBackend.flush();
                expect(Auth.account()).toEqual(false);
            });

            it('should not update the username property if unsuccessful', function () {
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.init();
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(500, '');
                Auth.logOut();

                expect(Auth.account().username).toEqual('TestUser');
                $httpBackend.flush();
                expect(Auth.account().username).toEqual('TestUser');
            });

            it('should redirect to LOGIN_PAGE if successful', function () {
                $location.url(AUTH_HOME);
                expect($location.url()).toEqual(AUTH_HOME);

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();
                $httpBackend.flush();

                expect($location.url()).toEqual(LOGIN_PAGE);
            });
        });

        describe('requireAnon method', function () {
            var ANONYMOUS_PAGE = '/path/to/anonymous/page';

            it('should redirect authenticated users to AUTH_HOME', function () {
                $location.url(ANONYMOUS_PAGE);
                expect($location.url()).toEqual(ANONYMOUS_PAGE);

                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.requireAnon();
                $httpBackend.flush();

                expect($location.url()).toEqual(AUTH_HOME);
            });

            it('should not redirect anonymous users', function () {
                $location.url(ANONYMOUS_PAGE);
                expect($location.url()).toEqual(ANONYMOUS_PAGE);

                $httpBackend.expectGET(resourceUrl).respond(403, '');
                Auth.requireAnon();
                $httpBackend.flush();

                expect($location.url()).toEqual(ANONYMOUS_PAGE);
            });
        });

        describe('requireAuth method', function () {
            var RESTRICTED_PAGE = '/path/to/restricted/page';

            it('should redirect anonymous users to LOGIN_PAGE and redirect back after login', function () {
                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);

                $httpBackend.expectGET(resourceUrl).respond(403, '');
                Auth.requireAuth();
                $httpBackend.flush();

                expect($location.url()).toEqual(LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(RESTRICTED_PAGE);
            });

            it('should not redirect authenticated users', function () {
                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);

                $httpBackend.expectGET(resourceUrl).respond('{"username":"TestUser"}');
                Auth.requireAuth();
                $httpBackend.flush();

                expect($location.url()).toEqual(RESTRICTED_PAGE);
            });
        });
    });

    describe('LoginCtrl controller', function () {
        var controller, scope, $httpBackend, $location,
            loginResourceUrl = API_URL + '/account/login';

        beforeEach(function () {
            inject(function($controller, $rootScope, _$httpBackend_, _$location_) {
                scope = $rootScope.$new();
                controller = $controller('LoginCtrl', { $scope: scope });
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        describe('logIn method', function () {
            it('should pass error status to view and not update the location on error', function () {
                scope.form = {
                    username: 'TestUser',
                    password: 'testpassword',
                };

                spyOn($location, 'url');

                $httpBackend.expectPOST(loginResourceUrl).respond(403, '');
                scope.logIn();
                $httpBackend.flush();

                expect($location.url).not.toHaveBeenCalled();
                expect(scope.form.error).toEqual(403);

                $httpBackend.expectPOST(loginResourceUrl).respond(500, '');
                scope.logIn();
                $httpBackend.flush();

                expect($location.url).not.toHaveBeenCalled();
                expect(scope.form.error).toEqual(500);
            });
        });
    });

    describe('RecoveryCtrl controller', function () {
        var controller, scope, $httpBackend,
            resetResourceUrl = API_URL + '/account/password_reset';

        beforeEach(function () {
            inject(function($controller, $rootScope, _$httpBackend_) {
                scope = $rootScope.$new();
                controller = $controller('RecoveryCtrl', { $scope: scope });
                $httpBackend = _$httpBackend_;
            });
        });

        describe('submit method', function () {
            it('should pass success and error responses to view', function () {
                scope.form = {
                    id: 'TestUser',
                };

                expect(scope.form.error).not.toBeDefined();

                $httpBackend.expectPOST(resetResourceUrl).respond(204, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.success).toEqual(true);

                $httpBackend.expectPOST(resetResourceUrl).respond(404, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.error).toEqual(404);

                $httpBackend.expectPOST(resetResourceUrl).respond(500, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.error).toEqual(500);
            });
        });
    });

    describe('TopBarCtrl controller', function () {
        var controller, scope;

        beforeEach(function () {
            inject(function($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('TopBarCtrl', { $scope: scope });
            });
        });
    });
});
