describe('openeis-ui.api', function () {
    var accountResourceUrl = settings.API_URL + 'account',
        loginResourceUrl = settings.API_URL + 'account/login',
        pwChangeResourceUrl = settings.API_URL + 'account/change_password',
        pwResetResourceUrl = settings.API_URL + 'account/password_reset',
        headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$');

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
            it('should PUT account recovery parameters', function () {
                var params = {
                    username: 'TestUser',
                    code: 'testcode',
                    password: 'testpassword',
                };

                $httpBackend.expectPUT(pwResetResourceUrl, angular.toJson(params)).respond(204, '');
                Auth.accountRecover2(params);
                $httpBackend.flush();
            });
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

    describe('DataMaps service', function () {
        var DataMaps, $httpBackend,
            testDataMaps = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

        beforeEach(function () {
            inject(function (_DataMaps_, _$httpBackend_) {
                DataMaps = _DataMaps_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should query for all data maps in a project by project ID', function () {
            var dataMaps;

            $httpBackend.expectGET(settings.API_URL + 'sensormaps?project=1').respond(angular.toJson(testDataMaps));
            dataMaps = DataMaps.query(1);
            $httpBackend.flush();

            expect(dataMaps.length).toEqual(testDataMaps.length);

            for (var i = 0; i < testDataMaps.length; i++) {
                expect(dataMaps[i].id).toEqual(testDataMaps[i].id);
            }
        });

        it('should create data maps from non-flattened data maps', function () {
            var newDataMap = { map: { sensors: [] } },
                result;

            spyOn(DataMaps, 'flattenMap').andReturn('flattenedMap');

            $httpBackend.expectPOST(settings.API_URL + 'sensormaps', '{"map":"flattenedMap"}').respond('');
            DataMaps.create(newDataMap);
            $httpBackend.flush();
        });

        it('should retrieve the data map defintion object', function () {
            $httpBackend.expectGET(settings.GENERAL_DEFINITION_URL).respond('');
            DataMaps.getDefinition();
            $httpBackend.flush();
        });

        it('should retrieve the data map units object', function () {
            $httpBackend.expectGET(settings.UNITS_URL).respond('');
            DataMaps.getUnits();
            $httpBackend.flush();
        });

        describe('flattenMap method', function () {
            it('should flatten data map objects into topics', function () {
                var map = {
                        sensors: [
                            { name: 'Site1', children: [
                                { name: 'Building1', children: [
                                    { name: 'System1', sensors: [
                                        { name: 'SensorA' },
                                        { name: 'SensorB' },
                                    ]},
                                ]},
                                { name: 'Building2' },
                            ]},
                            { name: 'Building3', sensors: [
                                { name: 'SensorB' },
                                { name: 'SensorC' },
                            ]},
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.sensors).toEqual({
                    'Site1': {},
                    'Site1/Building1': {},
                    'Site1/Building1/System1': {},
                    'Site1/Building1/System1/SensorA': {},
                    'Site1/Building1/System1/SensorB': {},
                    'Site1/Building2': {},
                    'Building3': {},
                    'Building3/SensorB': {},
                    'Building3/SensorC': {},
                });
            });

            it('should set the files property', function () {
                var files = {
                        File1: {
                            file: 'File1',
                            hasHeader: true,
                            columns: ['Timestamp', 'Value'],
                            signature: 'file1signature',
                            timestamp: 'file1timestamp',
                        },
                        File2: {
                            file: 'File2',
                            hasHeader: false,
                            columns: ['Column 1', 'Column 2', 'Column 3'],
                            signature: 'file2signature',
                            timestamp: 'file2timestamp',
                        },
                    },
                    map = {
                        sensors: [
                            { name: 'Building1', sensors: [
                                {
                                    name: 'SensorA',
                                    file: files.File1,
                                    column: 1,
                                },
                                {
                                    name: 'SensorB',
                                    file: files.File2,
                                    column: '1'
                                },
                                {
                                    name: 'SensorC',
                                    file: files.File2,
                                    column: '2'
                                },
                            ]},
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.files).toEqual({
                    '0': {
                        signature: files.File1.signature,
                        timestamp: files.File1.timestamp,
                    },
                    '1': {
                        signature: files.File2.signature,
                        timestamp: files.File2.timestamp,
                    },
                });

                expect(flattenedMap.sensors['Building1/SensorA'].file).toEqual('0');
                expect(flattenedMap.sensors['Building1/SensorB'].file).toEqual('1');
                expect(flattenedMap.sensors['Building1/SensorC'].file).toEqual('1');
            });

            it('should not include deleted objects', function () {
                var map = {
                        sensors: [
                            { name: 'Site1', children: [
                                { name: 'Building1', deleted: true },
                                { name: 'Building2', sensors: [
                                    { name: 'SensorA', deleted: false },
                                    { name: 'SensorB', deleted: true },
                                ]},
                            ]},
                            { name: 'Site2', deleted: true },
                            { name: 'Site3', deleted: false },
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.sensors).toEqual({
                    'Site1': {},
                    'Site1/Building2': {},
                    'Site1/Building2/SensorA': {},
                    'Site3': {},
                });
            });
        });

        describe('validateMap method', function () {
            it('validate data maps against JSON schema', function () {
                // TODO
            });
        });

        describe('ensureFileMetaData method', function () {
            it('should create file signatures for files with headers', function () {
                var files = [
                        { id: 1 },
                        { id: 2, signature: true },
                        { id: 3, signature: true, columns: true },
                    ];

                $httpBackend.whenGET(headUrlPattern).respond(200, angular.toJson({
                    has_header: true,
                    rows: [
                        ['header1', 'header2', 'header3'],
                    ],
                }));
                DataMaps.ensureFileMetaData(files);
                $httpBackend.flush();

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toEqual(['header1', 'header2', 'header3']);
                    expect(file.hasHeader).toBe(true);
                    expect(file.signature).toEqual({ headers: file.columns });
                });
            });

            it('should create file signatures for files without headers', function () {
                var files = [
                        { id: 1 },
                        { id: 2, signature: true },
                        { id: 3, signature: true, columns: true },
                    ];

                $httpBackend.whenGET(headUrlPattern).respond(200, angular.toJson({
                    has_header: false,
                    rows: [
                        ['value1', 'value2', 'value3'],
                    ],
                }));
                DataMaps.ensureFileMetaData(files);
                $httpBackend.flush();

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toEqual(['Column 1', 'Column 2', 'Column 3']);
                    expect(file.hasHeader).toBe(false);
                    expect(file.signature).toEqual({ headers: [null, null, null] });
                });
            });

            it('should skip files with signature, columns, and hasHeader properties', function () {
                var files = [
                        { id: 1, signature: true, columns: true, hasHeader: false },
                        { id: 2, signature: true, columns: true, hasHeader: false },
                        { id: 3, signature: true, columns: true, hasHeader: false },
                    ];

                // No API call should be made
                DataMaps.ensureFileMetaData(files);

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toBe(true);
                    expect(file.hasHeader).toBe(false);
                    expect(file.signature).toBe(true);
                });
            });
        });
    });
});
