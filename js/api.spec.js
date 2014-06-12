describe('openeis-ui.api', function () {
    var accountResourceUrl = settings.API_URL + 'account',
        loginResourceUrl = settings.API_URL + 'account/login',
        pwChangeResourceUrl = settings.API_URL + 'account/change_password',
        pwResetResourceUrl = settings.API_URL + 'account/password_reset';

    beforeEach(function () {
        module('openeis-ui.api');
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
                var account;

                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (response) {
                    account = response;
                });
                expect(account).toEqual(null);
                $httpBackend.flush();
                expect(account.username).toEqual('TestUser');

                // No API call second time around
                Auth.account();
            });

            it('should return false if not authenticated', function () {
                var account;

                $httpBackend.expectGET(accountResourceUrl).respond(403, '');
                Auth.account().then(function (response) {
                    account = response;
                });
                expect(account).toEqual(null);
                $httpBackend.flush();
                expect(account).toEqual(false);
            });
        });

        describe('accountCreate method', function () {
            it('should create accounts', function () {
                var newAccount = { username: 'newUser' };

                $httpBackend.expectPOST(accountResourceUrl, angular.toJson(newAccount)).respond(204, '');
                Auth.accountCreate(newAccount);
                $httpBackend.flush();
            });
        });

        describe('accountUpdate method', function () {
            it('should update accounts', function () {
                var newInfo = { email: 'newEmail' };

                $httpBackend.expectPATCH(accountResourceUrl, angular.toJson(newInfo)).respond(204, '');
                Auth.accountUpdate(newInfo);
                $httpBackend.flush();
            });
        });

        describe('accountPassword method', function () {
            it('should change account passwords', function () {
                var password = { old_password: 'old', new_password: 'new' };

                $httpBackend.expectPOST(pwChangeResourceUrl, angular.toJson(password)).respond(204, '');
                Auth.accountPassword(password);
                $httpBackend.flush();
            });
        });

        describe('accountRecover1 method', function () {
            it('should POST account ID', function () {
                $httpBackend.expectPOST(pwResetResourceUrl, '{"username_or_email":"TestUser"}').respond(204, '');
                Auth.accountRecover1('TestUser');
                $httpBackend.flush();
            });
        });

        describe('accountRecover2 method', function () {
            // TODO
        });

        describe('loginRedirect method', function () {
            it('should exist', function () {
                expect(Auth.loginRedirect).toBeDefined();
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
                $location.url(settings.LOGIN_PAGE);
                expect($location.url()).toEqual(settings.LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(settings.AUTH_HOME);
            });

            it('should redirect to loginRedirect if set', function () {
                var LOGIN_REDIRECT = '/after/login/path';

                Auth.loginRedirect(LOGIN_REDIRECT);

                $location.url(settings.LOGIN_PAGE);
                expect($location.url()).toEqual(settings.LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(LOGIN_REDIRECT);
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
                $location.url(settings.AUTH_HOME);
                expect($location.url()).toEqual(settings.AUTH_HOME);

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();
                $httpBackend.flush();

                expect($location.url()).toEqual(settings.LOGIN_PAGE);
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

            $httpBackend.expectGET(settings.API_URL + 'projects/' + testProjects[0].id).respond(angular.toJson(testProjects[0]));
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

            $httpBackend.expectGET(settings.API_URL + 'projects').respond(angular.toJson(testProjects));
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

            $httpBackend.expectPOST(settings.API_URL + 'projects').respond(angular.toJson(newProject));
            Projects.create(newProject).then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.name).toEqual(newProject.name);
        });
    });

    describe('Files service', function () {
        var Files, $httpBackend,
            headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$'),
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

            $httpBackend.expectGET(settings.API_URL + 'files/' + testFiles[0].id).respond(angular.toJson(testFiles[0]));
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

            $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson(testFiles));
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

        it('should update (rename) files', function () {
            $httpBackend.expectPATCH(settings.API_URL + 'files/' + testFiles[0].id).respond(angular.toJson(testFiles[0]));
            Files.update(testFiles[0]);
            $httpBackend.flush();
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

    describe('DataSets service', function () {
        var DataSets, $httpBackend,
            testDataSets = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

        beforeEach(function () {
            inject(function (_DataSets_, _$httpBackend_) {
                DataSets = _DataSets_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should create data sets', function () {
            var newDataSet = { map: 0, files: [0] };

            $httpBackend.expectPOST(settings.API_URL + 'datasets').respond(angular.toJson(newDataSet));
            DataSets.create(newDataSet);
            $httpBackend.flush();
        });

        it('should query for all data sets in a project by project ID', function () {
            var dataSets;

            $httpBackend.expectGET(settings.API_URL + 'datasets?project=1').respond(angular.toJson(testDataSets));
            dataSets = DataSets.query(1);
            $httpBackend.flush();

            expect(dataSets.length).toEqual(testDataSets.length);

            for (var i = 0; i < testDataSets.length; i++) {
                expect(dataSets[i].id).toEqual(testDataSets[i].id);
            }
        });

        it('should retrieve data set status', function () {
            var dataSet = { id: 1 },
                status;

            $httpBackend.expectGET(settings.API_URL + 'datasets/' + dataSet.id + '/status').respond('"completed"');
            DataSets.getStatus(dataSet).then(function (response) {
                status = response.data;
            });
            expect(status).toEqual(null);
            $httpBackend.flush();
            expect(status).toEqual('completed');
        });

        it('should retrieve data set errors', function () {
            var dataSet = { id: 1 },
                errors;

            $httpBackend.expectGET(settings.API_URL + 'datasets/' + dataSet.id + '/errors').respond('[]');
            DataSets.getErrors(dataSet).then(function (response) {
                errors = response.data;
            });
            expect(errors).toEqual(null);
            $httpBackend.flush();
            expect(errors).toEqual([]);
        });
    });

    describe('SensorMaps service', function () {
        var SensorMaps, $httpBackend,
            testSensorMaps = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

        beforeEach(function () {
            inject(function (_SensorMaps_, _$httpBackend_) {
                SensorMaps = _SensorMaps_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should query for all sensor maps in a project by project ID', function () {
            var sensorMaps;

            $httpBackend.expectGET(settings.API_URL + 'sensormaps?project=1').respond(angular.toJson(testSensorMaps));
            sensorMaps = SensorMaps.query(1);
            $httpBackend.flush();

            expect(sensorMaps.length).toEqual(testSensorMaps.length);

            for (var i = 0; i < testSensorMaps.length; i++) {
                expect(sensorMaps[i].id).toEqual(testSensorMaps[i].id);
            }
        });

        it('should create sensor maps from non-flattened sensor maps', function () {
            var newSensorMap = { map: { sensors: [] } },
                result;

            spyOn(SensorMaps, 'flattenMap').andReturn('flattenedMap');

            $httpBackend.expectPOST(settings.API_URL + 'sensormaps', '{"map":"flattenedMap"}').respond('');
            SensorMaps.create(newSensorMap);
            $httpBackend.flush();
        });

        it('should retrieve the sensor map defintion object', function () {
            $httpBackend.expectGET(settings.SENSORMAP_DEFINITION_URL).respond('');
            SensorMaps.getDefinition();
            $httpBackend.flush();
        });

        it('should retrieve the sensor map units object', function () {
            $httpBackend.expectGET(settings.SENSORMAP_UNITS_URL).respond('');
            SensorMaps.getUnits();
            $httpBackend.flush();
        });

        it('should flatten sensor map objects into topics', function () {
            // TODO
        });

        it('validate sensor maps against JSON schema', function () {
            // TODO
        });

        it('create file signatures', function () {
            // TODO
        });
    });
});
