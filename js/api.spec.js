describe('openeis-ui.api', function () {
    beforeEach(function () {
        module('openeis-ui.api');
    });

    describe('DataSets service', function () {
        var DataSets, $httpBackend,
            testDataSets = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

        beforeEach(function () {
            inject(function (_DataSets_, _$httpBackend_) {
                DataSets = _DataSets_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should create data sets', function () {
            var newDataSet = { map: 0, files: [0] };

            $httpBackend.expectPOST(settings.API_URL + 'datasets').respond(angular.toJson(newDataSet));
            DataSets.create(newDataSet);
            $httpBackend.flush();
        });

        it('should query for all data sets in a project by project ID', function () {
            var dataSets;

            $httpBackend.expectGET(settings.API_URL + 'datasets?project=1').respond(angular.toJson(testDataSets));
            dataSets = DataSets.query(1);
            $httpBackend.flush();

            expect(dataSets.length).toEqual(testDataSets.length);

            for (var i = 0; i < testDataSets.length; i++) {
                expect(dataSets[i].id).toEqual(testDataSets[i].id);
            }
        });

        it('should retrieve data set status', function () {
            var dataSet = { id: 1 },
                status;

            $httpBackend.expectGET(settings.API_URL + 'datasets/' + dataSet.id + '/status').respond('"completed"');
            DataSets.getStatus(dataSet).then(function (response) {
                status = response.data;
            });
            expect(status).toEqual(null);
            $httpBackend.flush();
            expect(status).toEqual('completed');
        });

        it('should retrieve data set errors', function () {
            var dataSet = { id: 1 },
                errors;

            $httpBackend.expectGET(settings.API_URL + 'datasets/' + dataSet.id + '/errors').respond('[]');
            DataSets.getErrors(dataSet).then(function (response) {
                errors = response.data;
            });
            expect(errors).toEqual(null);
            $httpBackend.flush();
            expect(errors).toEqual([]);
        });
    });

    describe('Applications service', function () {
        var Applications, $httpBackend,
            testApplications = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ];

        beforeEach(function () {
            inject(function (_Applications_, _$httpBackend_) {
                Applications = _Applications_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should retrieve list of applications', function () {
            $httpBackend.expectGET(settings.API_URL + 'applications').respond(angular.toJson(testApplications));

            var applications = Applications.query();
            $httpBackend.flush();

            expect(applications.length).toBe(3);
        });
    });
});
