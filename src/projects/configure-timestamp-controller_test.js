describe('openeis-ui.projects.configure-timestamp-controller', function () {
    var $httpBackend, controller, scope, DataFiles, $http, resolve, reject;

    beforeEach(function () {
        module('openeis-ui.projects.configure-timestamp-controller');

        DataFiles = { update: function () {
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

        inject(function (_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            controller = $controller('ConfigureTimestampCtrl', { $scope: scope, DataFiles: DataFiles, $http: $http });
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ConfigureTimestampCtrl controller', function () {
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
});
