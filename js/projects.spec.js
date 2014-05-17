describe('openeis-ui.projects', function () {
    var $httpBackend;

    beforeEach(function () {
        module('openeis-ui.projects');

        module(function($provide) {
            $provide.value('projects', []);
            $provide.value('project', {});
            $provide.value('dataFiles', []);
        });

        inject(function (_$httpBackend_) {
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ProjectsCtrl controller', function () {
        var controller, scope;

        beforeEach(function () {
            inject(function($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('ProjectsCtrl', { $scope: scope });
            });
        });

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

        it('should define a function for renaming projects by array index', inject(function (Projects) {
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

    describe('ProjectCtrl controller', function () {
        var controller, scope;

        beforeEach(function () {
            inject(function($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('ProjectCtrl', { $scope: scope });
            });
        });

        it('should define a function for uploading files', function () {
            expect(scope.upload).toBeDefined();

            // TODO: refactor $scope.upload to make it more testable
        });

        it('should define a function for deleting files by array index', inject(function (Files) {
            var testFile = { id: 1, file: 'test_file.csv' };

            expect(scope.deleteFile).toBeDefined();

            // Setup: populate scope.dataFiles
            $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson([testFile]));
            Files.query(1).then(function (response) {
                scope.dataFiles = response;
            });
            $httpBackend.flush();

            // Assert project file exists
            expect(scope.dataFiles.length).toEqual(1);

            $httpBackend.expectDELETE(settings.API_URL + 'files/' + testFile.id).respond(204, '');
            scope.deleteFile(0);
            $httpBackend.flush();

            // Assert project file deleted
            expect(scope.dataFiles.length).toEqual(0);
        }));
    });
});
