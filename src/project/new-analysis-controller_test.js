describe('openeis-ui.project.new-analysis-controller', function () {
    var $httpBackend, controller, scope, DataMaps, Applications;
    var testMap = { map: { sensors: {
        'object': {},
        'object/sensor1': { type: 'typeA' },
        'object/sensor2': { type: 'typeA' },
        'object/sensor3': { type: 'typeB' },
    }}};
    var testApps = [{
        name: 'app1',
        inputs: {
            input1: {
                sensor_type: 'typeA',
                count_min: 2,
                count_max: 2,
            },
        },
    }, {
        name: 'app2',
        inputs: {
            input1: {
                sensor_type: 'typeB',
                count_min: 2,
                count_max: null,
            },
        },
    }, {
        name: 'app3',
        inputs: {
            input1: {
                sensor_type: 'typeC',
                count_min: 1,
                count_max: 3,
            }
        },
    }];

    beforeEach(function () {
        module('openeis-ui.project.new-analysis-controller');

        inject(function (_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            controller = $controller('NewAnalysisCtrl', { $scope: scope });

            $httpBackend.expectGET(settings.API_URL + 'sensormaps/1').respond(angular.toJson(testMap));
            $httpBackend.expectGET(settings.API_URL + 'applications').respond(angular.toJson(testApps));
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('NewAnalysisCtrl controller', function () {
        describe('upon data set selection', function () {
            beforeEach(function () {
                scope.newAnalysis.dataSet = { map: 1 };
            });

            it('should create list of available sensors', function () {
                expect(scope.availableSensors).not.toBeDefined();
                scope.$digest();
                $httpBackend.flush();
                expect(scope.availableSensors.typeA.length).toBe(2);
                expect(scope.availableSensors.typeB.length).toBe(1);
                expect(scope.availableSensors.typeC).not.toBeDefined();
            });

            it('should determine application compatibility', function () {
                expect(scope.availableApps).not.toBeDefined();
                scope.$digest();
                $httpBackend.flush();
                expect(scope.availableApps[0].missingInputs).not.toBeDefined();
                expect(scope.availableApps[1].missingInputs.length).toBe(1);
                expect(scope.availableApps[2].missingInputs.length).toBe(1);
            });

            describe('and application selection', function () {
                var blankAppConfig = { parameters: {}, inputs: { input1: [{}, {}] } };

                beforeEach(function () {
                    scope.$digest();
                    scope.newAnalysis.application = testApps[0];
                });

                it('should create empty configuration', function () {
                    expect(scope.newAnalysis.configuration).not.toBeDefined();
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);
                });

                it('should preserve configuration if same application is re-selected', function () {
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);

                    var testConfig = {
                        parameters: { param1: 'value1', param2: 'value2' },
                        inputs: { input1: 'value1', input2: 'value2' },
                    };
                    scope.newAnalysis.configuration = testConfig;
                    scope.newAnalysis.application = null;
                    scope.$digest();
                    scope.newAnalysis.application = testApps[0];
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toBe(testConfig);

                    scope.newAnalysis.application = testApps[1];
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);
                });
            });
        });
    });
});
