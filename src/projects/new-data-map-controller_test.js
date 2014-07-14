describe('openeis-ui.projects.new-data-map-controller', function () {
    var $httpBackend, $controller, controller, scope, DataMaps, Modals, resolve, reject;

    beforeEach(function () {
        module('openeis-ui.projects.new-data-map-controller');

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

        inject(function (_$httpBackend_, $rootScope, _$controller_, _Modals_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            scope.project = { id: 1 };
            controller = $controller('NewDataMapCtrl', { $scope: scope, DataMaps: DataMaps });
            Modals = _Modals_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('NewDataMapCtrl controller', function () {
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
});
