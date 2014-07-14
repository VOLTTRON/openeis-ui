describe('openeis-ui.auth-route', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.auth-route');

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
});
