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
