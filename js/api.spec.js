describe('openeis-ui.api', function () {
    var API_URL = '/api',
        LOGIN_PAGE = '/path/to/login/page',
        AUTH_HOME = '/path/to/auth/home',
        accountResourceUrl = API_URL + '/account',
        loginResourceUrl = API_URL + '/account/login',
        pwResetResourceUrl = API_URL + '/account/password_reset';

    beforeEach(function () {
        module('openeis-ui.api');

        module(function($provide) {
            $provide.constant('API_URL', API_URL);
            $provide.constant('LOGIN_PAGE', LOGIN_PAGE);
            $provide.constant('AUTH_HOME', AUTH_HOME);
        });
    });

    describe('Auth service', function () {
        var Auth, $httpBackend, $location;

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
    });

    describe('Projects service', function () {
        var Projects, $httpBackend,
            testProjects = [
                { id: 1, name: 'Test project 1' },
                { id: 2, name: 'Test project 2' },
                { id: 3, name: 'Test project 3' },
            ];

        beforeEach(function () {
            inject(function (_Projects_, _$httpBackend_) {
                Projects = _Projects_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should get projects by project ID that can be saved and deleted', function () {
            var project;

            expect(Projects.get).toBeDefined();

            $httpBackend.expectGET(API_URL + '/projects/' + testProjects[0].id).respond(angular.toJson(testProjects[0]));
            Projects.get(testProjects[0].id).then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.id).toEqual(testProjects[0].id);
            expect(project.name).toEqual(testProjects[0].name);
            expect(project.$save).toBeDefined();
            expect(project.$delete).toBeDefined();
        });

        it('should query for all projects', function () {
            var projects;

            expect(Projects.query).toBeDefined();

            $httpBackend.expectGET(API_URL + '/projects').respond(angular.toJson(testProjects));
            Projects.query().then(function (response) {
                projects = response;
            });
            $httpBackend.flush();

            expect(projects.length).toEqual(testProjects.length);

            for (var i = 0; i < testProjects.length; i++) {
                expect(projects[i].id).toEqual(testProjects[i].id);
                expect(projects[i].name).toEqual(testProjects[i].name);
            }
        });

        it('should create new projects', function () {
            var project,
                newProject = { name: 'New project' };

            expect(Projects.create).toBeDefined();

            $httpBackend.expectPOST(API_URL + '/projects').respond(angular.toJson(newProject));
            Projects.create(newProject).then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.name).toEqual(newProject.name);
        });
    });

    describe('Files service', function () {
        var Files, $httpBackend,
            headUrlPattern = new RegExp('^' + API_URL + '\\/files\\/\\d+/head(\\?rows=\\d+)?$'),
            testFiles = [
                { id: 1, file: 'File 1' },
                { id: 2, file: 'File 2' },
                { id: 3, file: 'File 3' },
            ];

        beforeEach(function () {
            inject(function (_Files_, _$httpBackend_) {
                Files = _Files_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should get files by file ID that can be saved and deleted', function () {
            var file;

            expect(Files.get).toBeDefined();

            $httpBackend.expectGET(API_URL + '/files/' + testFiles[0].id).respond(angular.toJson(testFiles[0]));
            Files.get(testFiles[0].id).then(function (response) {
                file = response;
            });
            $httpBackend.flush();

            expect(file.id).toEqual(testFiles[0].id);
            expect(file.file).toEqual(testFiles[0].file);
            expect(file.$save).toBeDefined();
            expect(file.$delete).toBeDefined();
        });

        it('should query for all files in a project by project ID', function () {
            var files;

            expect(Files.query).toBeDefined();

            $httpBackend.expectGET(API_URL + '/files?project=1').respond(angular.toJson(testFiles));
            Files.query(1).then(function (response) {
                files = response;
            });
            $httpBackend.flush();

            expect(files.length).toEqual(testFiles.length);

            for (var i = 0; i < testFiles.length; i++) {
                expect(files[i].id).toEqual(testFiles[i].id);
                expect(files[i].file).toEqual(testFiles[i].file);
            }
        });

        it('should retrieve the first rows of a file by file ID', function () {
            var head,
                testHead = {
                    has_header: true,
                    rows: [
                        [ 'Col1', 'Col2', 'Col3' ],
                        [ '1-1', '1-2', '1-3' ],
                        [ '2-1', '2-2', '2-3' ],
                        [ '3-1', '3-2', '3-3' ],
                    ],
                };

            expect(Files.head).toBeDefined();

            $httpBackend.expectGET(headUrlPattern).respond(angular.toJson(testHead));
            Files.head(1).then(function (response) {
                head = response.data;
            });
            $httpBackend.flush();

            expect(head.has_header).toEqual(testHead.has_header);

            for (var i = 0; i < testHead.rows.length; i++) {
                expect(head.rows[i]).toEqual(testHead.rows[i]);
            }
        });
    });
});
