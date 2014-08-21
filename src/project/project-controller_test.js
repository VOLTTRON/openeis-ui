describe('openeis-ui.project.project-controller', function () {
    var $httpBackend, $controller, controller, scope;

    beforeEach(function () {
        module('openeis-ui.project.project-controller');

        module(function($provide) {
            $provide.value('project', {});
            $provide.value('dataFiles', []);
            $provide.value('dataSets', []);
            $provide.value('dataMaps', []);
            $provide.value('analyses', []);
            $provide.value('sharedAnalyses', []);
        });

        inject(function (_$httpBackend_, $rootScope, _$controller_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            controller = $controller('ProjectCtrl', { $scope: scope });
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ProjectCtrl controller', function () {
        describe('statusCheck function', function () {
            var DataSets, statusResolve, errorsResolve, getAnalysisResolve;

            beforeEach(function () {
                DataSets = {
                    getStatus: jasmine.createSpy('DataSets.getStatus').andReturn({
                        then: function (successCallback) { statusResolve = successCallback; },
                    }),
                    getErrors: jasmine.createSpy('DataSets.getErrors').andReturn({
                        then: function (successCallback) { errorsResolve = successCallback; },
                    }),
                };
                Analyses = {
                    get: jasmine.createSpy('Analyses.get').andReturn({
                        $promise: {
                            then: function (successCallback) { getAnalysisResolve = successCallback; },
                        },
                    }),
                };
                controller = $controller('ProjectCtrl', {
                    $scope: scope,
                    DataSets: DataSets,
                    Analyses: Analyses,
                });
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

            it('should check status of incomplete analyses', function () {
                scope.analyses = [
                    { id: 1, status: 'complete' },
                    { id: 2, status: 'running' },
                    { id: 3, status: 'queued' },
                ];

                scope.statusCheck();
                expect(Analyses.get).not.toHaveBeenCalledWith(1);
                expect(Analyses.get).toHaveBeenCalledWith(2);
                expect(Analyses.get).toHaveBeenCalledWith(3);
            });

            it('should check again after a delay if any are not complete', function () {
                var timeout = jasmine.createSpy('timeout');
                timeout.cancel = jasmine.createSpy('timeout.cancel');
                controller = $controller('ProjectCtrl', {
                    $scope: scope,
                    DataSets: DataSets,
                    Analyses: Analyses,
                    $timeout: timeout,
                });

                scope.dataSets = [{ status: { status: 'processing' } }];
                scope.analyses = [{ status: 'running' }];
                scope.statusCheck();
                statusResolve({ data: { status: 'complete', percent: '100' } });
                errorsResolve({ data: 0 });
                getAnalysisResolve({ status: 'complete' });
                scope.$digest();
                expect(timeout.cancel).not.toHaveBeenCalled();
                expect(timeout).not.toHaveBeenCalled();

                scope.dataSets = [{ status: { status: 'processing' } }];
                scope.analyses = [{ status: 'running' }];
                scope.statusCheck();
                statusResolve({ data: { status: 'processing', percent: '42.42' } });
                errorsResolve({ data: 0 });
                getAnalysisResolve({ status: 'running' });
                scope.$digest();
                expect(timeout.cancel.callCount).toBe(2);
                expect(timeout.callCount).toBe(2);
                expect(timeout).toHaveBeenCalledWith(scope.statusCheck, 1000);
            });
        });

        describe('configureTimestamp function', function () {
            it('should retrieve first rows of file', inject(function (DataFiles) {
                spyOn(DataFiles, 'head').andReturn({ then: function () {} });
                scope.dataFiles = { 0: { id: 1 } };
                scope.configureTimestamp(0);
                expect(DataFiles.head).toHaveBeenCalledWith(1);
            }));

            it('should set timestampFile and open a modal', inject(function (DataFiles, Modals) {
                var resolve;
                spyOn(DataFiles, 'head').andReturn({ then: function (successCallback) {
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
            var upload, DataFiles, resolve;

            beforeEach(function () {
                upload = { upload: jasmine.createSpy('upload.upload').andReturn({
                    then: function (successCallback) {
                        resolve = successCallback;
                    }
                })};

                DataFiles = { get: jasmine.createSpy('DataFiles.get').andReturn({
                    then: function (successCallback) {
                        resolve = successCallback;
                    }
                })};

                controller = $controller('ProjectCtrl', { $scope: scope, $upload: upload, DataFiles: DataFiles });
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
                expect(DataFiles.get).toHaveBeenCalledWith(1);
                expect(scope.configureTimestamp).toHaveBeenCalledWith(0);
            });
        });

        describe('deleteFile function', function () {
            it('should delete files by array index', inject(function (DataFiles) {
                var testFile = { id: 1, file: 'test_file.csv' };

                expect(scope.deleteFile).toBeDefined();

                // Setup: populate scope.dataFiles
                $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson([testFile]));
                DataFiles.query(1).then(function (response) {
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

        describe('viewAnalysis function', function () {
            var getDataResolve;

            beforeEach(function () {
                Analyses = {
                    getData: jasmine.createSpy('Analyses.getData').andReturn({
                        then: function (successCallback) { getDataResolve = successCallback; },
                    }),
                };
                controller = $controller('ProjectCtrl', {
                    $scope: scope,
                    Analyses: Analyses,
                });
            });

            it('should retrieve analysis data', function () {
                var analysis = { id: 1 };

                scope.viewAnalysis(analysis);
                getDataResolve('analysis1Data');

                expect(scope.viewingAnalysis).toBe(analysis);
                expect(scope.viewingAnalysisData).toBe('analysis1Data');
            });
        });

        describe('shareAnalysis function', function () {
            var createResolve;

            beforeEach(function () {
                SharedAnalyses = {
                    create: jasmine.createSpy('SharedAnalyses.create').andReturn({
                        $promise: {
                            then: function (successCallback) { createResolve = successCallback; },
                        },
                    }),
                };
                controller = $controller('ProjectCtrl', {
                    $scope: scope,
                    SharedAnalyses: SharedAnalyses,
                });
            });

            it('should create shared analysis and add it to sharedAnalyses', function () {
                spyOn(scope, 'viewLink');
                expect(scope.sharedAnalyses.length).toBe(0);

                scope.shareAnalysis({ id: 1 });
                createResolve('newSharedAnalyses');

                expect(scope.sharedAnalyses.length).toBe(1);
                expect(scope.sharedAnalyses[0]).toBe('newSharedAnalyses');
                expect(scope.viewLink).toHaveBeenCalled();
            });
        });

        describe('viewLink function', function () {
            it('should generate URL from correspoding sharedAnalysis', function () {
                scope.sharedAnalyses = [
                    { analysis: 1, key: '1111' },
                    { analysis: 2, key: '2222' },
                    { analysis: 3, key: '3333' },
                ];

                scope.viewLink(2);

                expect(scope.viewingLink).toEqual({
                    url: 'http://localhost:9876/shared-analyses/2/2222',
                    sharedAnalysis: scope.sharedAnalyses[1],
                });
            });
        });
    });
});
