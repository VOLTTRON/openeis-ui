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
            accountResourceUrl = API_URL + '/account',
            loginResourceUrl = API_URL + '/account/login',
            pwResetResourceUrl = API_URL + '/account/password_reset';

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

        describe('account method', function () {
            it('should only call the API once', function () {
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account(function () {
                    expect(account.username).toEqual('TestUser');
                });
                $httpBackend.flush();

                // No API call second time around
                Auth.account(function () {
                    expect(account.username).toEqual('TestUser');
                });
            });
        });

        describe('accountRecover1 method', function () {
            it('should POST account ID', function () {
                $httpBackend.expectPOST(pwResetResourceUrl, '{"username_or_email":"TestUser"}').respond(204, '');
                Auth.accountRecover1('TestUser');
                $httpBackend.flush();
            });
        });

        describe('logIn method', function () {
            it('should only try to update the account property if successful', function () {
                $httpBackend.expectPOST(loginResourceUrl).respond(403, '');
                // No API call to retrieve account details
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                // API call to retrieve account details
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();
            });

            it('should redirect to AUTH_HOME if successful', function () {
                $location.url(LOGIN_PAGE);
                expect($location.url()).toEqual(LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(AUTH_HOME);
            });
        });

        describe('logOut method', function () {
            it('should update the username property if successful', function () {
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();
                $httpBackend.flush();

                Auth.account().then(function (account) {
                    expect(account).toEqual(false);
                });
            });

            it('should not update the username property if unsuccessful', function () {
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(500, '');
                Auth.logOut();
                $httpBackend.flush();

                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
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

                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.requireAnon();
                $httpBackend.flush();

                expect($location.url()).toEqual(AUTH_HOME);
            });

            it('should not redirect anonymous users', function () {
                $location.url(ANONYMOUS_PAGE);
                expect($location.url()).toEqual(ANONYMOUS_PAGE);

                $httpBackend.expectGET(accountResourceUrl).respond(403, '');
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

                $httpBackend.expectGET(accountResourceUrl).respond(403, '');
                Auth.requireAuth();
                $httpBackend.flush();

                expect($location.url()).toEqual(LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(RESTRICTED_PAGE);
            });

            it('should not redirect authenticated users', function () {
                $location.url(RESTRICTED_PAGE);
                expect($location.url()).toEqual(RESTRICTED_PAGE);

                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
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
            pwResetResourceUrl = API_URL + '/account/password_reset';

        beforeEach(function () {
            inject(function($controller, $rootScope, _$httpBackend_) {
                scope = $rootScope.$new();
                controller = $controller('RecoveryCtrl', { $scope: scope });
                $httpBackend = _$httpBackend_;
            });
        });

        describe('submit method stage 1', function () {
            it('should pass success and error responses to view', function () {
                scope.recovery = {
                    id: 'TestUser',
                };

                expect(scope.form.error).not.toBeDefined();

                $httpBackend.expectPOST(pwResetResourceUrl).respond(404, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.error.status).toEqual(404);

                $httpBackend.expectPOST(pwResetResourceUrl).respond(500, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.error.status).toEqual(500);

                $httpBackend.expectPOST(pwResetResourceUrl).respond(204, '');
                scope.submit();
                $httpBackend.flush();

                expect(scope.form.success).toBeTruthy();
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
