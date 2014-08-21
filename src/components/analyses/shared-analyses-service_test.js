describe('openeis-ui.analyses.shared-analyses-service', function () {
    var SharedAnalyses, $httpBackend,
        testSharedAnalyses = [
            { id: 1, name: 'Test shared analysis 1' },
            { id: 2, name: 'Test shared analysis 2' },
            { id: 3, name: 'Test shared analysis 3' },
        ];

    beforeEach(function () {
        module('openeis-ui.analyses.shared-analyses-service');

        inject(function (_SharedAnalyses_, _$httpBackend_) {
            SharedAnalyses = _SharedAnalyses_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('SharedAnalyses service', function () {
        it('should get shared analyses by analysis ID and key', function () {
            var sharedAnalysis;

            expect(SharedAnalyses.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/' + testSharedAnalyses[0].id + '?key=' + 'abc123').respond(angular.toJson(testSharedAnalyses[0]));
            SharedAnalyses.get(testSharedAnalyses[0].id, 'abc123').$promise.then(function (response) {
                sharedAnalysis = response;
            });
            $httpBackend.flush();

            expect(sharedAnalysis.id).toEqual(testSharedAnalyses[0].id);
            expect(sharedAnalysis.name).toEqual(testSharedAnalyses[0].name);
        });

        it('should query for all shared analyses', function () {
            var sharedAnalyses;

            expect(SharedAnalyses.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses?project=1').respond(angular.toJson(testSharedAnalyses));
            SharedAnalyses.query(1).$promise.then(function (response) {
                sharedAnalyses = response;
            });
            $httpBackend.flush();

            expect(sharedAnalyses.length).toEqual(testSharedAnalyses.length);

            for (var i = 0; i < testSharedAnalyses.length; i++) {
                expect(sharedAnalyses[i].id).toEqual(testSharedAnalyses[i].id);
                expect(sharedAnalyses[i].name).toEqual(testSharedAnalyses[i].name);
            }
        });

        it('should create new shared analyses', function () {
            var newSharedAnalysis;

            expect(SharedAnalyses.create).toBeDefined();

            $httpBackend.expectPOST(settings.API_URL + 'shared-analyses').respond('{"analysis":1}');
            SharedAnalyses.create(1).$promise.then(function (response) {
                newSharedAnalysis = response;
            });
            $httpBackend.flush();

            expect(newSharedAnalysis.analysis).toBe(1);
        });

        it('should retrieve analysis output data by analysis ID and key', function () {
            var sharedAnalysisData,
                table1Data = [ {x: 't1x1', y: 't1y1'}, {x: 't1x2', y: 't1y2'} ],
                table2Data = [ {x: 't2x1', y: 't2y1'}, {x: 't2x2', y: 't2y2'} ];

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123').respond(angular.toJson({ 'table1': {}, 'table2': {} }));
            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123&output=table1').respond(angular.toJson(table1Data));
            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123&output=table2').respond(angular.toJson(table2Data));
            SharedAnalyses.getData(1, 'abc123').then(function (data) {
                sharedAnalysisData = data;
            });
            $httpBackend.flush();

            // Compare JSON since .toEqual() doesn't work here for some reason
            // expect(sharedAnalysisData).toEqual({ table1: table1Data, table2: table2Data });
            expect(angular.toJson(sharedAnalysisData)).toBe(angular.toJson({ table1: table1Data, table2: table2Data }));
        });
    });
});
