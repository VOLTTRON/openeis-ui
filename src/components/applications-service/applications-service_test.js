describe('openeis-ui.applications-service', function () {
    beforeEach(function () {
        module('openeis-ui.applications-service');
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
