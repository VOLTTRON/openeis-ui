describe('openeis-ui.projects-service', function () {
    var Projects, $httpBackend,
        testProjects = [
            { id: 1, name: 'Test project 1' },
            { id: 2, name: 'Test project 2' },
            { id: 3, name: 'Test project 3' },
        ];

    beforeEach(function () {
        module('openeis-ui.projects-service');

        inject(function (_Projects_, _$httpBackend_) {
            Projects = _Projects_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('Projects service', function () {
        it('should get projects by project ID that can be saved and deleted', function () {
            var project;

            expect(Projects.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'projects/' + testProjects[0].id).respond(angular.toJson(testProjects[0]));
            Projects.get(testProjects[0].id).then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.id).toEqual(testProjects[0].id);
            expect(project.name).toEqual(testProjects[0].name);
            expect(project.$save).toBeDefined();
            expect(project.$delete).toBeDefined();
        });

        it('should query for all projects', function () {
            var projects;

            expect(Projects.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'projects').respond(angular.toJson(testProjects));
            Projects.query().then(function (response) {
                projects = response;
            });
            $httpBackend.flush();

            expect(projects.length).toEqual(testProjects.length);

            for (var i = 0; i < testProjects.length; i++) {
                expect(projects[i].id).toEqual(testProjects[i].id);
                expect(projects[i].name).toEqual(testProjects[i].name);
            }
        });

        it('should create new projects', function () {
            var project,
                newProject = { name: 'New project' };

            expect(Projects.create).toBeDefined();

            $httpBackend.expectPOST(settings.API_URL + 'projects').respond(angular.toJson(newProject));
            Projects.create(newProject).then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.name).toEqual(newProject.name);
        });

        it('should clone projects', function () {
            var project;

            $httpBackend.expectPOST(settings.API_URL + 'projects/1/clone', { name: 'New project' }).respond('{"id":2}');
            Projects.clone(1, 'New project').then(function (response) {
                project = response;
            });
            $httpBackend.flush();

            expect(project.id).toBe(2);
        });
    });
});
