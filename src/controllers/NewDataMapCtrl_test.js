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

describe('NewDataMapCtrl controller', function () {
    var $httpBackend, $controller, controller, scope, DataMaps, $location, resolve, reject,
        testProject = { id: 1 };

    beforeEach(function () {
        module('openeis-ui');

        module(function($provide) {
            $provide.value('project', testProject);
            $provide.value('dataFiles', []);
        });

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

        inject(function (_$httpBackend_, $rootScope, _$controller_, _$location_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            scope.project = { id: 1 };
            controller = $controller('NewDataMapCtrl', { $scope: scope, DataMaps: DataMaps });
            $location = _$location_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should ensure file metadata', function () {
        spyOn(DataMaps, 'ensureFileMetaData');
        controller = $controller('NewDataMapCtrl', { $scope: scope, DataMaps: DataMaps });
        expect(DataMaps.ensureFileMetaData).toHaveBeenCalled();
    });

    describe('addChild', function () {
        it('should add child objects', function () {
            expect(scope.newDataMap.map.sensors.length).toBe(0);

            var newChild = {
                    level: 'site',
                    name: 'NameWith/Slash',
                };
            spyOn(window, 'prompt').andReturn(newChild.name);
            scope.addChild(newChild.level);
            expect(scope.newDataMap.map.sensors.length).toBe(1);
            // Slashes should be replaced with dashes
            expect(scope.newDataMap.map.sensors[0].name).toBe('NameWith-Slash');
        });

        it('should detect duplicate names', function () {
            var promptCount = 0;

            spyOn(window, 'prompt').andCallFake(function (message) {
                if (promptCount++ < 2) {
                    expect(message.substr(0, 5)).toBe('Name:');
                    return 'NewSite';
                }

                expect(message.substr(0, 6)).toBe('Error:');
                return false;
            });

            scope.addChild('site');
            expect(window.prompt.callCount).toBe(1);
            expect(scope.newDataMap.map.sensors.length).toBe(1);

            scope.addChild('site');
            expect(window.prompt.callCount).toBe(3);
            expect(scope.newDataMap.map.sensors.length).toBe(1);
        });
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
        it('should return to project view on success', function () {
            spyOn($location, 'url');

            scope.save();
            resolve();
            expect($location.url).toHaveBeenCalledWith('projects/' + testProject.id);
        });

        it('should alert user on failure', function () {
            spyOn(window, 'alert');
            spyOn($location, 'url');

            scope.save();
            reject({ data: { __all__: [] } });
            expect(window.alert).toHaveBeenCalled();
            expect($location.url).not.toHaveBeenCalled();
        });
    });

    it('should confirm on page leave if and only if child objects have been added', function () {
        var confirmSpy = spyOn(window, 'confirm'),
            event;

        event = scope.$broadcast('$locationChangeStart');
        expect(window.confirm.callCount).toBe(0);

        spyOn(window, 'prompt').andReturn('NewSite');
        scope.addChild('site');
        expect(scope.newDataMap.map.sensors.length).toBe(1);

        confirmSpy.andReturn(false);
        event = scope.$broadcast('$locationChangeStart');
        expect(window.confirm.callCount).toBe(1);
        expect(event.defaultPrevented).toBe(true);

        confirmSpy.andReturn(true);
        event = scope.$broadcast('$locationChangeStart');
        expect(window.confirm.callCount).toBe(2);
        expect(event.defaultPrevented).toBe(false);
    });
});
