describe('openeis-ui.projects.projects-controller', function () {
    var $httpBackend, controller, scope;

    beforeEach(function () {
        module('openeis-ui.projects.projects-controller');

        inject(function (_$httpBackend_, $controller, $rootScope) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            controller = $controller('ProjectsCtrl', { $scope: scope, projects: [] });
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ProjectsCtrl controller', function () {
        it('should define a function for creating projects', function () {
            var newProject = { name: 'New project' };

            expect(scope.newProject.create).toBeDefined();
            expect(scope.projects.length).toEqual(0);

            scope.newProject.name = newProject.name;
            $httpBackend.expectPOST(settings.API_URL + 'projects').respond(angular.toJson(newProject));
            scope.newProject.create();
            $httpBackend.flush();

            expect(scope.projects.length).toEqual(1);
            expect(scope.projects[0].name).toEqual(newProject.name);
        });

        describe('renameProject function', function () {
            it('should rename projects by array index', inject(function (Projects) {
                var testProject = { id: 1, name: 'Test project' };

                expect(scope.renameProject).toBeDefined();

                // Setup: populate scope.projects
                $httpBackend.expectGET(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
                Projects.get(testProject.id).then(function (response) {
                    scope.projects = [response];
                });
                $httpBackend.flush();

                // Assert original name
                expect(scope.projects[0].name).toEqual(testProject.name);

                testProject.name = 'Test project new';
                spyOn(window, 'prompt').andReturn(testProject.name);

                $httpBackend.expectPUT(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
                scope.renameProject(0);
                $httpBackend.flush();

                // Assert new name
                expect(scope.projects[0].name).toEqual(testProject.name);
            }));

            it('should validate new project name', inject(function (Projects) {
                scope.projects = [{ id: 1, name: 'Test project', $save: function () {} }];

                angular.forEach(['', false, null], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.renameProject(0);
                    // Assert original name
                    expect(scope.projects[0].name).toEqual('Test project');
                });

                // Non-empty strings should always be valid
                angular.forEach(['false', 'null', '0'], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.renameProject(0);
                    // Assert new name
                    expect(scope.projects[0].name).toEqual(v);
                });
            }));
        });

        it('should define a function for deleting projects by array index', inject(function (Projects) {
            var testProject = { id: 1, name: 'Test project' };

            expect(scope.deleteProject).toBeDefined();

            // Setup: populate scope.projects
            $httpBackend.expectGET(settings.API_URL + 'projects/' + testProject.id).respond(angular.toJson(testProject));
            Projects.get(testProject.id).then(function (response) {
                scope.projects = [response];
            });
            $httpBackend.flush();

            // Assert project exists
            expect(scope.projects[0]).toBeDefined();

            $httpBackend.expectDELETE(settings.API_URL + 'projects/' + testProject.id).respond(204, '');
            scope.deleteProject(0);
            $httpBackend.flush();

            // Assert project deleted
            expect(scope.projects[0]).not.toBeDefined();
        }));
    });
});
