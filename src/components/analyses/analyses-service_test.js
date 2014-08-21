describe('openeis-ui.analyses.analyses-service', function () {
    var Analyses, $httpBackend,
        testAnalyses = [
            { id: 1, name: 'Test analysis 1' },
            { id: 2, name: 'Test analysis 2' },
            { id: 3, name: 'Test analysis 3' },
        ];

    beforeEach(function () {
        module('openeis-ui.analyses.analyses-service');

        inject(function (_Analyses_, _$httpBackend_) {
            Analyses = _Analyses_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('Analyses service', function () {
        it('should get analyses by analysis ID', function () {
            var analysis;

            expect(Analyses.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'analyses/' + testAnalyses[0].id).respond(angular.toJson(testAnalyses[0]));
            Analyses.get(testAnalyses[0].id).$promise.then(function (response) {
                analysis = response;
            });
            $httpBackend.flush();

            expect(analysis.id).toEqual(testAnalyses[0].id);
            expect(analysis.name).toEqual(testAnalyses[0].name);
        });

        it('should query for all analyses', function () {
            var analyses;

            expect(Analyses.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'analyses?project=1').respond(angular.toJson(testAnalyses));
            Analyses.query(1).$promise.then(function (response) {
                analyses = response;
            });
            $httpBackend.flush();

            expect(analyses.length).toEqual(testAnalyses.length);

            for (var i = 0; i < testAnalyses.length; i++) {
                expect(analyses[i].id).toEqual(testAnalyses[i].id);
                expect(analyses[i].name).toEqual(testAnalyses[i].name);
            }
        });

        it('should create new analyses', function () {
            var analysis,
                newAnalysis = { name: 'New analysis' };

            expect(Analyses.create).toBeDefined();

            $httpBackend.expectPOST(settings.API_URL + 'analyses').respond(angular.toJson(newAnalysis));
            Analyses.create(newAnalysis).$promise.then(function (response) {
                analysis = response;
            });
            $httpBackend.flush();

            expect(analysis.name).toEqual(newAnalysis.name);
        });

        it('should retrieve analysis output data', function () {
            var analysisData,
                table1Data = [ {x: 't1x1', y: 't1y1'}, {x: 't1x2', y: 't1y2'} ],
                table2Data = [ {x: 't2x1', y: 't2y1'}, {x: 't2x2', y: 't2y2'} ];

            $httpBackend.expectGET(settings.API_URL + 'analyses/1/data').respond(angular.toJson({ 'table1': {}, 'table2': {} }));
            $httpBackend.expectGET(settings.API_URL + 'analyses/1/data?output=table1').respond(angular.toJson(table1Data));
            $httpBackend.expectGET(settings.API_URL + 'analyses/1/data?output=table2').respond(angular.toJson(table2Data));
            Analyses.getData(1).then(function (data) {
                analysisData = data;
            });
            $httpBackend.flush();

            // Compare JSON since .toEqual() doesn't work here for some reason
            // expect(analysisData).toEqual({ table1: table1Data, table2: table2Data });
            expect(angular.toJson(analysisData)).toBe(angular.toJson({ table1: table1Data, table2: table2Data }));
        });
    });
});
