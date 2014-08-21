describe('openeis-ui.shared-analyses.shared-analyses-controller', function () {
    var $controller, scope, SharedAnalyses, getResolve, getReject, getDataResolve;

    beforeEach(function () {
        module('openeis-ui.shared-analyses.shared-analyses-controller');

        SharedAnalyses = {
            get: jasmine.createSpy('Analyses.get').andReturn({
                $promise: {
                    then: function (successCallback, errorCallback) {
                        getResolve = successCallback;
                        getReject = errorCallback;
                    },
                },
            }),
            getData: jasmine.createSpy('Analyses.getData').andReturn({
                then: function (successCallback) { getDataResolve = successCallback; },
            }),
        };

        inject(function ($rootScope, _$controller_) {
            $controller = _$controller_;
            scope = $rootScope.$new();
        });
    });

    it('should retrieve analysis and analysis data with key', function () {
        var controller = $controller('SharedAnalysesCtrl', {
                $scope: scope,
                SharedAnalyses: SharedAnalyses,
                $routeParams: { analysisId: 1, key: 'abc123' },
            }),
            sharedAnalysis = { analysis: 1, name: 'Analysis1', reports: [] };

        expect(SharedAnalyses.get).toHaveBeenCalledWith(1, 'abc123');

        getResolve(sharedAnalysis);

        expect(SharedAnalyses.getData).toHaveBeenCalledWith(1, 'abc123');

        getDataResolve('data');

        expect(scope.valid).toBe(true);
        expect(scope.sharedAnalysis).toBe(sharedAnalysis);
        expect(scope.data).toBe('data');
    });

    it('should retrieve analysis and analysis data with key', function () {
        var controller = $controller('SharedAnalysesCtrl', {
                $scope: scope,
                SharedAnalyses: SharedAnalyses,
                $routeParams: { analysisId: 1, key: 'wrongkey' },
            });

        expect(SharedAnalyses.get).toHaveBeenCalledWith(1, 'wrongkey');

        getReject();

        expect(scope.valid).toBe(false);
    });
});
