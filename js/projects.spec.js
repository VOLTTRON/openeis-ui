describe('openeis-ui.projects', function () {
    var $httpBackend;

    beforeEach(function () {
        module('openeis-ui.projects');

        module(function($provide) {
            $provide.value('projects', []);
            $provide.value('project', {});
            $provide.value('dataFiles', []);
            $provide.value('dataSets', []);
            $provide.value('dataMaps', []);
        });

        inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ProjectsCtrl controller', function () {
        var controller, scope;

        beforeEach(function () {
            inject(function($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('ProjectsCtrl', { $scope: scope });
            });
        });

        it('should define a function for creating projects', function () {
            var newProject = { name: 'New project' };

            expect(scope.newProject.create).toBeDefined();
            expect(scope.projects.length).toEqual(0);

            scope.newProject.name = newProject.name;
            $httpBackend.expectPOST(settings.API_URL + 'projects').respond(angular.toJson(newProject));
            scope.newProject.create();
            $httpBackend.flush();

            expect(scope.projects.length).toEqual(1);
            expect(scope.projects[0].name).toEqual(newProject.name);
        });

        describe('renameProject function', function () {
            it('should rename projects by array index', inject(function (Projects) {
                var testProject = { id: 1, name: 'Test project' };

                expect(scope.renameProject).toBeDefined();

                // Setup: populate scope.projects
                $httpBackend.expectGET(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
                Projects.get(testProject.id).then(function (response) {
                    scope.projects = [response];
                });
                $httpBackend.flush();

                // Assert original name
                expect(scope.projects[0].name).toEqual(testProject.name);

                testProject.name = 'Test project new';
                spyOn(window, 'prompt').andReturn(testProject.name);

                $httpBackend.expectPUT(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
                scope.renameProject(0);
                $httpBackend.flush();

                // Assert new name
                expect(scope.projects[0].name).toEqual(testProject.name);
            }));

            it('should validate new project name', inject(function (Projects) {
                scope.projects = [{ id: 1, name: 'Test project', $save: function () {} }];

                angular.forEach(['', false, null], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.renameProject(0);
                    // Assert original name
                    expect(scope.projects[0].name).toEqual('Test project');
                });

                // Non-empty strings should always be valid
                angular.forEach(['false', 'null', '0'], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.renameProject(0);
                    // Assert new name
                    expect(scope.projects[0].name).toEqual(v);
                });
            }));
        });

        it('should define a function for deleting projects by array index', inject(function (Projects) {
            var testProject = { id: 1, name: 'Test project' };

            expect(scope.deleteProject).toBeDefined();

            // Setup: populate scope.projects
            $httpBackend.expectGET(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
            Projects.get(testProject.id).then(function (response) {
                scope.projects = [response];
            });
            $httpBackend.flush();

            // Assert project exists
            expect(scope.projects[0]).toBeDefined();

            $httpBackend.expectDELETE(settings.API_URL + 'projects/' + testProject.id).respond(204, '');
            scope.deleteProject(0);
            $httpBackend.flush();

            // Assert project deleted
            expect(scope.projects[0]).not.toBeDefined();
        }));
    });

    describe('ProjectCtrl controller', function () {
        var $controller, controller, scope;

        beforeEach(function () {
            inject(function($rootScope, _$controller_) {
                $controller = _$controller_;
                scope = $rootScope.$new();
                controller = $controller('ProjectCtrl', { $scope: scope });
            });
        });

        describe('statusCheck function', function () {
            var DataSets, statusResolve, errorsResolve;

            beforeEach(function () {
                DataSets = {
                    getStatus: jasmine.createSpy('DataSets.getStatus').andReturn({
                        then: function (successCallback) { statusResolve = successCallback; },
                    }),
                    getErrors: jasmine.createSpy('DataSets.getErrors').andReturn({
                        then: function (successCallback) { errorsResolve = successCallback; },
                    }),
                };
                controller = $controller('ProjectCtrl', { $scope: scope, DataSets: DataSets });
            });

            it('should check status and errors of incomplete data set ingests', function () {
                scope.dataSets = [
                    { status: { status: 'complete' } },
                    { status: { status: 'processing' } },
                ];

                scope.statusCheck();
                expect(DataSets.getStatus).not.toHaveBeenCalledWith(scope.dataSets[0]);
                expect(DataSets.getErrors).not.toHaveBeenCalledWith(scope.dataSets[0]);
                expect(DataSets.getStatus).toHaveBeenCalledWith(scope.dataSets[1]);
                expect(DataSets.getErrors).toHaveBeenCalledWith(scope.dataSets[1]);
            });

            it('should append processing status with percentage', function () {
                scope.dataSets = [{ status: { status: 'processing' } }];

                scope.statusCheck();
                statusResolve({ data: { status: 'processing', percent: '42.42' } });
                expect(scope.dataSets[0].status.status).toBe('processing - 42%');

                scope.statusCheck();
                statusResolve({ data: { status: 'complete', percent: '100' } });
                expect(scope.dataSets[0].status.status).toBe('complete');
            });

            it('should retrieve and set errors', function () {
                scope.dataSets = [{ status: { status: 'processing' } }];
                scope.statusCheck();
                errorsResolve({ data: 'errors' });
                expect(scope.dataSets[0].errors).toBe('errors');
            });

            it('should check again after a delay if any files are not complete', function () {
                var timeout = jasmine.createSpy('timeout');
                timeout.cancel = jasmine.createSpy('timeout.cancel');
                controller = $controller('ProjectCtrl', { $scope: scope, DataSets: DataSets, $timeout: timeout });

                scope.dataSets = [{ status: { status: 'processing' } }];
                scope.statusCheck();
                statusResolve({ data: { status: 'complete', percent: '100' } });
                errorsResolve({ data: 0 });
                scope.$digest();
                expect(timeout.cancel).not.toHaveBeenCalled();
                expect(timeout).not.toHaveBeenCalled();

                scope.dataSets = [{ status: { status: 'processing' } }];
                scope.statusCheck();
                statusResolve({ data: { status: 'processing', percent: '42.42' } });
                errorsResolve({ data: 0 });
                scope.$digest();
                expect(timeout.cancel).toHaveBeenCalled();
                expect(timeout).toHaveBeenCalledWith(scope.statusCheck, 1000);
            });
        });

        describe('configureTimestamp function', function () {
            it('should retrieve first rows of file', inject(function (Files) {
                spyOn(Files, 'head').andReturn({ then: function () {} });
                scope.dataFiles = { 0: { id: 1 } };
                scope.configureTimestamp(0);
                expect(Files.head).toHaveBeenCalledWith(1);
            }));

            it('should set timestampFile and open a modal', inject(function (Files, Modals) {
                var resolve;
                spyOn(Files, 'head').andReturn({ then: function (successCallback) {
                    resolve = successCallback;
                }});
                spyOn(Modals, 'openModal');
                scope.dataFiles = { 0: { id: 1 } };
                scope.configureTimestamp(0);

                resolve({ data: {
                    has_header: false, rows: [['val1', 'val2', 'val3']]
                }});
                expect(scope.timestampFile.head).toEqual({
                    has_header: false,
                    rows: [['val1', 'val2', 'val3']],
                });
                expect(scope.timestampFile.cols).toEqual([0, 1, 2]);

                resolve({ data: {
                    has_header: true,
                    rows: [['col1', 'col2'], ['val1', 'val2']],
                }});
                expect(scope.timestampFile.head).toEqual({
                    has_header: true,
                    header: ['col1', 'col2'],
                    rows: [['val1', 'val2']],
                });
                expect(scope.timestampFile.cols).toEqual([0, 1]);

                expect(Modals.openModal).toHaveBeenCalledWith('configureTimestamp');
            }));
        });

        describe('upload function', function () {
            var upload, Files, resolve;

            beforeEach(function () {
                upload = { upload: jasmine.createSpy('upload.upload').andReturn({
                    then: function (successCallback) {
                        resolve = successCallback;
                    }
                })};

                Files = { get: jasmine.createSpy('Files.get').andReturn({
                    then: function (successCallback) {
                        resolve = successCallback;
                    }
                })};

                controller = $controller('ProjectCtrl', { $scope: scope, $upload: upload, Files: Files });
            });

            it('should upload selected files with $upload', function () {
                scope.upload([{ files: ['file1', 'file2', 'file2'] }]);
                expect(upload.upload.callCount).toBe(3);
            });

            it('should retrieve file and add it to array', function () {
                scope.dataFiles = [];
                scope.configureTimestamp = jasmine.createSpy('configureTimestamp');
                scope.upload({
                    0: { files: ['file1', 'file2', 'file2'] },
                    val: function () { return { triggerHandler: function () {} }; }
                });
                resolve({ data: { id: 1 }});
                resolve('file');
                expect(scope.dataFiles.length).toBe(1);
                expect(scope.dataFiles[0]).toBe('file');
                expect(Files.get).toHaveBeenCalledWith(1);
                expect(scope.configureTimestamp).toHaveBeenCalledWith(0);
            });
        });

        describe('deleteFile function', function () {
            it('should delete files by array index', inject(function (Files) {
                var testFile = { id: 1, file: 'test_file.csv' };

                expect(scope.deleteFile).toBeDefined();

                // Setup: populate scope.dataFiles
                $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson([testFile]));
                Files.query(1).then(function (response) {
                    scope.dataFiles = response;
                });
                $httpBackend.flush();

                // Assert project file exists
                expect(scope.dataFiles.length).toEqual(1);

                $httpBackend.expectDELETE(settings.API_URL + 'files/' + testFile.id).respond(204, '');
                scope.deleteFile(0);
                $httpBackend.flush();

                // Assert project file deleted
                expect(scope.dataFiles.length).toEqual(0);
            }));
        });

        describe('showErrors function', function () {
            it('should set files and errors properties of errorsModal', function () {
                scope.dataFiles = [
                    { id: 1, file: 'File1' },
                    { id: 2, file: 'File2' }
                ];
                expect(scope.errorsModal.files).not.toBeDefined();
                expect(scope.errorsModal.errors).not.toBeDefined();

                scope.showErrors({
                    files: [
                        { name: 0, file: 1 },
                        { name: 1, file: 2 },
                        { name: 2, file: 2 },
                    ],
                    errors: 'errors',
                });
                expect(scope.errorsModal.files).toEqual({
                    0: 'File1',
                    1: 'File2',
                    2: 'File2'
                });
                expect(scope.errorsModal.errors).toBe('errors');
            });
        });
    });

    describe('TimestampCtrl controller', function () {
        var controller, scope, Files, $http, resolve, reject;

        beforeEach(function () {
            Files = { update: function () {
                return { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }};
            }};

            $http = function () {
                return { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }};
            };

            inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                controller = $controller('TimestampCtrl', { $scope: scope, Files: Files, $http: $http });
            });
        });

        describe('preview', function () {
            beforeEach(function () {
                scope.timestampFile = { id: 1 };
                scope.modal.columns = { col1: true, col2: false };
                scope.preview();
            });

            it('should alert user on failure', function () {
                spyOn(window, 'alert');
                reject({ data: 'rejection' });
                expect(scope.modal.confirm).toBeFalsy();
                expect(window.alert).toHaveBeenCalled();
            });

            it('should move to confirmation on success', function () {
                resolve({ data: 'preview' });
                expect(scope.modal.confirm).toBe(true);
                expect(scope.modal.timestamps).toBe('preview');
            });
        });

        describe('save', function () {
            beforeEach(function () {
                scope.timestampFile = { id: 1 };
                scope.selectedColumns = [0, 1];
                scope.save();
            });

            it('should alert user on failure', function () {
                spyOn(window, 'alert');
                reject({ data: 'rejection' });
                expect(scope.modal.confirm).toBeFalsy();
                expect(window.alert).toHaveBeenCalled();
            });

            it('should close modal on success', inject(function (Modals) {
                spyOn(Modals, 'closeModal');
                resolve({ data: 'preview' });
                expect(Modals.closeModal).toHaveBeenCalledWith('configureTimestamp');
            }));
        });
    });

    describe('NewDataSetCtrl controller', function () {
        var $controller, controller, scope, DataSets, DataMaps, Modals, resolve, reject;

        beforeEach(function () {
            DataSets = { create: function () {
                return { $promise: { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }}};
            }};

            DataMaps = { ensureFileMetaData: function () {} };

            inject(function($rootScope, _$controller_, _Modals_) {
                $controller = _$controller_;
                scope = $rootScope.$new();
                controller = $controller('NewDataSetCtrl', { $scope: scope, DataMaps: DataMaps, DataSets: DataSets });
                Modals = _Modals_;
            });
        });

        it('should ensure file metadata', function () {
            spyOn(DataMaps, 'ensureFileMetaData');
            controller = $controller('NewDataSetCtrl', { $scope: scope, DataMaps: DataMaps });
            expect(DataMaps.ensureFileMetaData).toHaveBeenCalled();
        });

        describe('save', function () {
            it('should call DataSets.create', function () {
                spyOn(DataSets, 'create').andCallThrough();

                scope.newDataSet = {
                    map: { id: 1 },
                    files: {
                        0: 'File1',
                        1: 'File2',
                    },
                };
                scope.save();
                expect(DataSets.create).toHaveBeenCalledWith({
                    map: scope.newDataSet.map.id,
                    files: [
                        { name: '0', file: scope.newDataSet.files[0] },
                        { name: '1', file: scope.newDataSet.files[1] },
                    ],
                });
            });

            it('should call statusCheck, close modal, and add data set to array on success', function () {
                scope.dataSets = [];
                scope.newDataSet = { map: { id: 1 }, files: {} };
                scope.statusCheck = jasmine.createSpy('statusCheck');
                spyOn(Modals, 'closeModal');

                scope.save();
                resolve('newDataSet');
                expect(scope.dataSets[0]).toBe('newDataSet');
                expect(scope.statusCheck).toHaveBeenCalled();
                expect(Modals.closeModal).toHaveBeenCalledWith('newDataSet');
            });

            it('should alert on failure', function () {
                scope.dataSets = [];
                scope.newDataSet = { map: { id: 1 }, files: {} };
                spyOn(Modals, 'closeModal');
                spyOn(window, 'alert');
                scope.save();
                reject();
                expect(scope.dataSets.length).toBe(0);
                expect(Modals.closeModal).not.toHaveBeenCalled();
                expect(window.alert).toHaveBeenCalled();
            });
        });
    });

    describe('hasSignature filter', function () {
        it('should only return files matching specified signature', inject(function (hasSignatureFilter) {
            var signature = 'signature',
                fileWith = { signature: 'signature' },
                fileWithout = { signature: 'notsignature' };

            expect(hasSignatureFilter([fileWith], signature)).toEqual([fileWith]);
            expect(hasSignatureFilter([fileWithout], signature)).toEqual([]);
        }));
    });

    describe('hasTimestamp filter', function () {
        it('should only return files with timestamp configurations', inject(function (hasTimestampFilter) {
            var fileWith = { timestamp: true },
                fileWithout = {};

            expect(hasTimestampFilter([fileWith])).toEqual([fileWith]);
            expect(hasTimestampFilter([fileWithout])).toEqual([]);
        }));
    });

    describe('NewDataMapCtrl controller', function () {
        var $controller, controller, scope, DataMaps, Modals, resolve, reject;

        beforeEach(function () {
            DataMaps = {
                ensureFileMetaData: function () {},
                validateMap: function () {
                    return { then: function (successCallback) {
                        resolve = successCallback;
                    }};
                },
                create: function () {
                    return { $promise: { then: function (successCallback, errorCallback) {
                        resolve = successCallback;
                        reject = errorCallback;
                    }}};
                },
            };

            inject(function($rootScope, _$controller_, _Modals_) {
                $controller = _$controller_;
                scope = $rootScope.$new();
                scope.project = { id: 1 };
                controller = $controller('NewDataMapCtrl', { $scope: scope, DataMaps: DataMaps });
                Modals = _Modals_;
            });
        });

        it('should ensure file metadata', function () {
            spyOn(DataMaps, 'ensureFileMetaData');
            controller = $controller('NewDataMapCtrl', { $scope: scope, DataMaps: DataMaps });
            expect(DataMaps.ensureFileMetaData).toHaveBeenCalled();
        });

        it('should validate map changes', function () {
            spyOn(DataMaps, 'validateMap').andCallThrough();
            expect(DataMaps.validateMap).not.toHaveBeenCalled();
            expect(scope.newDataMap.valid).toBe(false);

            scope.newDataMap.map.sensors.push('NewSensor');
            scope.$digest();
            resolve({ valid: true });
            expect(DataMaps.validateMap).toHaveBeenCalled();
            expect(scope.newDataMap.valid).toBe(true);
        });

        it('should create data maps', function () {
            spyOn(DataMaps, 'create').andCallThrough();
            expect(DataMaps.create).not.toHaveBeenCalled();
            scope.save();
            expect(DataMaps.create).toHaveBeenCalled();
        });

        describe('save', function () {
            it('should should not close modal and alert user on failure', function () {
                spyOn(window, 'alert');
                spyOn(Modals, 'closeModal');

                scope.save();
                reject({ data: { __all__: [] } });
                expect(window.alert).toHaveBeenCalled();
                expect(Modals.closeModal).not.toHaveBeenCalled();
            });

            it('should close modal and add data map to array on success', function () {
                scope.dataMaps = [];
                spyOn(Modals, 'closeModal');

                scope.save();
                resolve('newDataMap');
                expect(scope.dataMaps[0]).toBe('newDataMap');
                expect(Modals.closeModal).toHaveBeenCalledWith('newDataMap');
            });
        });

        it('should add child objects', function () {
            expect(scope.newDataMap.map.sensors.length).toBe(0);

            scope.newChild = { name: 'NameWith/Slash' };
            scope.addChild();
            expect(scope.newDataMap.map.sensors.length).toBe(1);
            // Slashes should be replaced with dashes
            expect(scope.newDataMap.map.sensors[0].name).toBe('NameWith-Slash');
        });
    });

    describe('NewDataReportCtrl controller', function () {
        var controller, scope, DataMaps, Applications;

        beforeEach(function () {
            inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                controller = $controller('NewDataReportCtrl', { $scope: scope });
            });
        });

        it('should determine application compatibility upon data set selection', function () {
            var testMap = { map: { sensors: {
                'object': {},
                'object/sensor1': { type: 'typeA' },
                'object/sensor2': { type: 'typeA' },
                'object/sensor3': { type: 'typeB' },
            }}};
            var testApps = [{
                name: 'app1',
                inputs: [{
                    sensor_type: 'typeA',
                    count_min: 2,
                }],
            }, {
                name: 'app2',
                inputs: [{
                    sensor_type: 'typeB',
                    count_min: 2,
                }],
            }, {
                name: 'app3',
                inputs: [{
                    sensor_type: 'typeC',
                    count_min: 1,
                }],
            }];

            $httpBackend.expectGET(settings.API_URL + 'sensormaps/1').respond(angular.toJson(testMap));
            $httpBackend.expectGET(settings.API_URL + 'applications').respond(angular.toJson(testApps));

            scope.newDataReport.dataSet = { map: 1 };
            scope.$digest();

            $httpBackend.flush();

            expect(scope.availableApps[0].missingInputs.length).toBe(0);
            expect(scope.availableApps[1].missingInputs.length).toBe(1);
            expect(scope.availableApps[2].missingInputs.length).toBe(1);
        });
    });
});
