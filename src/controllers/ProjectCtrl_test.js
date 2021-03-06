// Copyright (c) 2014, Battelle Memorial Institute
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.
//
//
// This material was prepared as an account of work sponsored by an
// agency of the United States Government.  Neither the United States
// Government nor the United States Department of Energy, nor Battelle,
// nor any of their employees, nor any jurisdiction or organization
// that has cooperated in the development of these materials, makes
// any warranty, express or implied, or assumes any legal liability
// or responsibility for the accuracy, completeness, or usefulness or
// any information, apparatus, product, software, or process disclosed,
// or represents that its use would not infringe privately owned rights.
//
// Reference herein to any specific commercial product, process, or
// service by trade name, trademark, manufacturer, or otherwise does
// not necessarily constitute or imply its endorsement, recommendation,
// or favoring by the United States Government or any agency thereof,
// or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the
// United States Government or any agency thereof.
//
// PACIFIC NORTHWEST NATIONAL LABORATORY
// operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
// under Contract DE-AC05-76RL01830

describe('ProjectCtrl controller', function () {
    var $httpBackend, $controller, controller, scope;

    beforeEach(function () {
        module('openeis-ui');

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

        it('should check status and errors of in-progress data set ingests', function () {
            scope.dataSets = [
                { status: { status: 'complete' } },
                { status: { status: 'processing' } },
                { status: { status: 'incomplete' } },
            ];

            scope.statusCheck();
            expect(DataSets.getStatus).not.toHaveBeenCalledWith(scope.dataSets[0]);
            expect(DataSets.getErrors).not.toHaveBeenCalledWith(scope.dataSets[0]);
            expect(DataSets.getStatus).toHaveBeenCalledWith(scope.dataSets[1]);
            expect(DataSets.getErrors).toHaveBeenCalledWith(scope.dataSets[1]);
            expect(DataSets.getStatus).not.toHaveBeenCalledWith(scope.dataSets[2]);
            expect(DataSets.getErrors).not.toHaveBeenCalledWith(scope.dataSets[2]);
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
        it('should retrieve first rows of file and list of timezones', inject(function (DataFiles, $q) {
            spyOn(DataFiles, 'head').andReturn($q.defer().promise);
            $httpBackend.expectGET(settings.TIMEZONES_URL).respond('["tz1","tz2"]');
            scope.dataFiles = { 0: { id: 1 } };
            scope.configureTimestamp(0);
            $httpBackend.flush();
            expect(DataFiles.head).toHaveBeenCalledWith(1);
        }));

        it('should set timestampFile and open a modal', inject(function (DataFiles, Modals, $q, $rootScope) {
            var headResponse = {};
            spyOn(DataFiles, 'head').andReturn($q.when(headResponse));
            spyOn(Modals, 'openModal');
            scope.dataFiles = { 0: { id: 1 } };
            $httpBackend.whenGET(settings.TIMEZONES_URL).respond('["tz1","tz2"]');

            headResponse.has_header = false;
            headResponse.rows = [['val1', 'val2', 'val3']];
            scope.configureTimestamp(0);
            $httpBackend.flush();
            $rootScope.$apply();
            expect(DataFiles.head).toHaveBeenCalledWith(1);
            expect(scope.timestampFile.head).toEqual({
                has_header: false,
                rows: [['val1', 'val2', 'val3']],
            });
            expect(scope.timestampFile.cols).toEqual([0, 1, 2]);

            delete scope.dataFiles[0].head;
            headResponse.has_header = true;
            headResponse.rows = [['col1', 'col2'], ['val1', 'val2']];
            scope.configureTimestamp(0);
            $httpBackend.flush();
            $rootScope.$apply();
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
        var upload, DataFiles, $rootScope,
            uploads = [],
            gets = [];

        beforeEach(inject(function ($q, _$rootScope_) {
            $rootScope = _$rootScope_;

            uploads = [];
            upload = { upload: jasmine.createSpy('upload.upload').andCallFake(function () {
                var deferred = $q.defer();

                uploads.push(deferred);

                return deferred.promise;
            }) };

            DataFiles = { get: jasmine.createSpy('DataFiles.get').andCallFake(function () {
                var deferred = $q.defer();

                gets.push(deferred);

                return deferred.promise;
            }) };

            controller = $controller('ProjectCtrl', { $scope: scope, $upload: upload, DataFiles: DataFiles });
        }));

        it('should upload selected files with $upload', function () {
            scope.upload(['file1', 'file2', 'file2']);
            expect(upload.upload.callCount).toBe(3);
        });

        it('should retrieve file and add it to array', function () {
            scope.dataFiles = [];
            scope.configureTimestamp = jasmine.createSpy('configureTimestamp');

            scope.upload(['file1', 'file2', 'file2']);
            angular.forEach(uploads, function (upload, key) {
                upload.resolve({ data: { id: key } });
            });
            $rootScope.$apply();
            expect(DataFiles.get).toHaveBeenCalledWith(0);
            expect(DataFiles.get).toHaveBeenCalledWith(1);
            expect(DataFiles.get).toHaveBeenCalledWith(2);

            angular.forEach(gets, function (get, key) {
                get.resolve('file' + key);
            });
            $rootScope.$apply();
            expect(scope.dataFiles).toEqual(['file0', 'file1', 'file2']);
            expect(scope.configureTimestamp).toHaveBeenCalledWith(0);
            expect(scope.configureTimestamp).toHaveBeenCalledWith(1);
            expect(scope.configureTimestamp).toHaveBeenCalledWith(2);
        });

        it('should display server response on error', inject(function ($q) {
            spyOn(window, 'alert');
            scope.upload(['file1', 'file2', 'file3']);
            uploads[0].reject({ data: { file: ['Some error', 'Some other error']}});
            $rootScope.$apply();
            expect(window.alert).toHaveBeenCalledWith('Some error\nSome other error');
        }));
    });

    describe('delete function', function () {
        var testFile = { id: 1, name: 'test_file.csv' };

        beforeEach(inject(function (DataFiles) {
            // populate scope.dataFiles
            $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson([testFile]));
            DataFiles.query(1).then(function (response) {
                scope.dataFiles = response;
            });
            $httpBackend.flush();
        }));

        it('should display a confirmation', function () {
            spyOn(window, 'confirm').andReturn(false);
            scope.delete('dataFiles', 0);
            expect(window.confirm).toHaveBeenCalled();
        });

        it('should delete items by array index', function () {
            spyOn(window, 'confirm').andReturn(true);

            // Assert project file exists
            expect(scope.dataFiles.length).toEqual(1);

            $httpBackend.expectDELETE(settings.API_URL + 'files/' + testFile.id).respond(204, '');
            scope.delete('dataFiles', 0);
            $httpBackend.flush();

            // Assert project file deleted
            expect(scope.dataFiles.length).toEqual(0);
        });
    });

    describe('showErrors function', function () {
        it('should set files and errors properties of errorsModal', function () {
            scope.dataFiles = [
                { id: 1, name: 'File1' },
                { id: 2, name: 'File2' }
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
