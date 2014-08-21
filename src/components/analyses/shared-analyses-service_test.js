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
        it('should get shared analyses by analysis ID', function () {
            var sharedAnalysis;

            expect(SharedAnalyses.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/' + testSharedAnalyses[0].id).respond(angular.toJson(testSharedAnalyses[0]));
            SharedAnalyses.get(testSharedAnalyses[0].id).$promise.then(function (response) {
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
    });
});
