// Copyright (c) 2014, Battelle Memorial Institute
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.
//
//
// This material was prepared as an account of work sponsored by an
// agency of the United States Government.  Neither the United States
// Government nor the United States Department of Energy, nor Battelle,
// nor any of their employees, nor any jurisdiction or organization
// that has cooperated in the development of these materials, makes
// any warranty, express or implied, or assumes any legal liability
// or responsibility for the accuracy, completeness, or usefulness or
// any information, apparatus, product, software, or process disclosed,
// or represents that its use would not infringe privately owned rights.
//
// Reference herein to any specific commercial product, process, or
// service by trade name, trademark, manufacturer, or otherwise does
// not necessarily constitute or imply its endorsement, recommendation,
// or favoring by the United States Government or any agency thereof,
// or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the
// United States Government or any agency thereof.
//
// PACIFIC NORTHWEST NATIONAL LABORATORY
// operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
// under Contract DE-AC05-76RL01830

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
                scope.projects = [{ id: 1, name: 'Test project', $save: angular.noop }];

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

        describe('cloneProject function', function () {
            it('should clone projects by array index', inject(function (Projects) {
                scope.projects = [{ id: 1, name: 'Test project' }];

                expect(scope.renameProject).toBeDefined();

                spyOn(window, 'prompt').andReturn('Test project 2');

                $httpBackend.expectPOST(settings.API_URL + 'projects/1/clone').respond('{"id":2,"name":"Test project 2"}');
                scope.cloneProject(0);
                $httpBackend.flush();

                expect(scope.projects[1].id).toBe(2);
                expect(scope.projects[1].name).toBe('Test project 2');
            }));

            it('should validate new project name', inject(function (Projects) {
                spyOn(Projects, 'clone').andReturn({ then: angular.noop });
                scope.projects = [{ id: 1, name: 'Test project' }];

                angular.forEach(['', false, null], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.cloneProject(0);
                    expect(Projects.clone).not.toHaveBeenCalled();
                });

                // Non-empty strings should always be valid
                angular.forEach(['false', 'null', '0'], function (v, k) {
                    window.prompt = function () { return v; };
                    scope.cloneProject(0);
                    expect(Projects.clone).toHaveBeenCalledWith(1, v);
                });
            }));
        });
    });
});
