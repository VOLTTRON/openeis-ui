describe('openeis-ui.project', function () {
    var $httpBackend;

    beforeEach(function () {
        module('openeis-ui.project');

        inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
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

    describe('NewDataReportCtrl controller', function () {
        var controller, scope, DataMaps, Applications;
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
            inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                controller = $controller('NewDataReportCtrl', { $scope: scope });

                $httpBackend.expectGET(settings.API_URL + 'sensormaps/1').respond(angular.toJson(testMap));
                $httpBackend.expectGET(settings.API_URL + 'applications').respond(angular.toJson(testApps));
            });
        });

        describe('upon data set selection', function () {
            beforeEach(function () {
                scope.newDataReport.dataSet = { map: 1 };
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
                    scope.newDataReport.application = testApps[0];
                });

                it('should create empty configuration', function () {
                    expect(scope.newDataReport.configuration).not.toBeDefined();
                    scope.$digest();
                    expect(scope.newDataReport.configuration).toEqual(blankAppConfig);
                });

                it('should preserve configuration if same application is re-selected', function () {
                    scope.$digest();
                    expect(scope.newDataReport.configuration).toEqual(blankAppConfig);

                    var testConfig = {
                        parameters: { param1: 'value1', param2: 'value2' },
                        inputs: { input1: 'value1', input2: 'value2' },
                    };
                    scope.newDataReport.configuration = testConfig;
                    scope.newDataReport.application = null;
                    scope.$digest();
                    scope.newDataReport.application = testApps[0];
                    scope.$digest();
                    expect(scope.newDataReport.configuration).toBe(testConfig);

                    scope.newDataReport.application = testApps[1];
                    scope.$digest();
                    expect(scope.newDataReport.configuration).toEqual(blankAppConfig);
                });
            });
        });
    });
});
