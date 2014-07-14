describe('openeis-ui.projects.new-data-set-controller', function () {
    var $httpBackend, $controller, controller, scope, DataSets, DataMaps, Modals, resolve, reject;

    beforeEach(function () {
        module('openeis-ui.projects.new-data-set-controller');

        DataSets = { create: function () {
            return { $promise: { then: function (successCallback, errorCallback) {
                resolve = successCallback;
                reject = errorCallback;
            }}};
        }};

        DataMaps = { ensureFileMetaData: function () {} };

        inject(function (_$httpBackend_, $rootScope, _$controller_, _Modals_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            controller = $controller('NewDataSetCtrl', { $scope: scope, DataMaps: DataMaps, DataSets: DataSets });
            Modals = _Modals_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('NewDataSetCtrl controller', function () {
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
});
