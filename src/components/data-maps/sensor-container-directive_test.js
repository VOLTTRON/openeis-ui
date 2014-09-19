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

describe('openeis-ui.data-maps.sensor-container-directive', function () {
    beforeEach(function () {
        module('openeis-ui.data-maps.sensor-container-directive');
        module('openeis-ui.templates');
    });

    describe('sensorContainer directive', function () {
        var $httpBackend, $compile, scope, definition,
            directive, isolateScope;

        beforeEach(inject(function(_$httpBackend_, $rootScope, _$compile_) {
            $httpBackend = _$httpBackend_;
            $compile = _$compile_;
            scope = $rootScope.$new();
        }));

        // Helper function to keep things DRY
        function compile() {
            directive = directive || angular.element('<sensor-container container="rootContainer" files=""></sensor-container>');

            $httpBackend.whenGET(settings.SCHEMA_DEFINITION_URL).respond(angular.toJson(definition));
            $httpBackend.whenGET(settings.SCHEMA_UNITS_URL).respond('{}');
            $compile(directive)(scope);
            $httpBackend.flush();
            scope.$digest();

            isolateScope = directive.isolateScope();
        }

        it('should handle nested objects', function () {
            definition = {
                site: {},
                building: {},
                RTU: {},
            };
            scope.rootContainer = { level: 'site', name: 'Site1', children: [
                { level: 'building', name: 'Building1' },
                { level: 'building', name: 'Building2' },
                { level: 'building', name: 'Building3', children: [
                    { level: 'RTU', name: 'RTU1' },
                ]},
            ]};
            compile();

            // 3 buildings + 1 RTU
            expect(directive[0].querySelectorAll('sensor-container').length).toBe(4);
            // 1 RTU
            expect(directive[0].querySelectorAll('sensor-container sensor-container sensor-container').length).toBe(1);
        });

        it('should replace asterisk string with array of all attributes or sensors', function () {
            definition = {
                site: { attribute_list: '*', sensor_list: ['sensor2'] },
                building: { attribute_list: ['attribute3'], sensor_list: '*' },
                attributes: {
                    attribute1: {},
                    attribute2: {},
                    attribute3: {},
                },
                sensors: {
                    sensor1: {},
                    sensor2: {},
                    sensor3: {},
                }
            };
            scope.rootContainer = { level: 'site', name: 'Site1', children: [
                { level: 'building', name: 'Building1' },
            ]};
            compile();

            var siteAttributes = directive.find('select')[0].querySelectorAll('option:not([value=""])'),
                siteSensors = directive.find('select')[1].querySelectorAll('option:not([value=""])'),
                buildingAttributes = directive.find('select')[2].querySelectorAll('option:not([value=""])');
                buildingSensors = directive.find('select')[3].querySelectorAll('option:not([value=""])');

            expect(siteAttributes.length).toBe(3);
            expect(siteAttributes[0].innerHTML).toBe('attribute1');
            expect(siteAttributes[1].innerHTML).toBe('attribute2');
            expect(siteAttributes[2].innerHTML).toBe('attribute3');

            expect(siteSensors.length).toBe(1);
            expect(siteSensors[0].innerHTML).toBe('sensor2');

            expect(buildingAttributes.length).toBe(1);
            expect(buildingAttributes[0].innerHTML).toBe('attribute3');

            expect(buildingSensors.length).toBe(3);
            expect(buildingSensors[0].innerHTML).toBe('sensor1');
            expect(buildingSensors[1].innerHTML).toBe('sensor2');
            expect(buildingSensors[2].innerHTML).toBe('sensor3');
        });

        it('should remove timezone attribute from child objects', function () {
            definition = {
                site: { attribute_list: '*' },
                building: { attribute_list: '*' },
                attributes: {
                    address: {},
                    timezone: {},
                }
            };
            scope.rootContainer = { level: 'site', name: 'Site1', children: [
                { level: 'building', name: 'Building1' },
            ]};
            compile();

            var siteAttributes = directive.find('select')[0].querySelectorAll('option:not([value=""])'),
                buildingAttributes = directive.find('select')[1].querySelectorAll('option:not([value=""])');

            expect(siteAttributes.length).toBe(2);
            expect(siteAttributes[0].innerHTML).toBe('address');
            expect(siteAttributes[1].innerHTML).toBe('timezone');

            expect(buildingAttributes.length).toBe(1);
            expect(buildingAttributes[0].innerHTML).toBe('address');
        });

        it('should add attributes', function () {
            definition = {
                site: {
                    attribute_list: ['attribute1'],
                },
                attributes: {
                    attribute1: {}
                },
            };
            scope.rootContainer = { level: 'site', name: 'Site1' };
            compile();

            expect(isolateScope.container.attributes).not.toBeDefined();
            expect(isolateScope.objectDefinition.attribute_list.length).toBe(1);

            isolateScope.newAttribute = {
                name: 'attribute1',
                value: 'attributeValue',
            };
            isolateScope.addAttribute();

            // Attribute should be added to container.attributes
            expect(isolateScope.container.attributes.attribute1).toBe('attributeValue');
            // Attribute should be removed from attribute_list
            expect(isolateScope.objectDefinition.attribute_list.length).toBe(0);

            expect(directive.find('dt').length).toBe(0);
            scope.$digest();
            // Attribute should be added to view
            expect(directive.find('dt').prop('innerHTML')).toBe('attribute1');
        });

        it('should add and delete sensors', function () {
            definition = {
                site: {
                    sensor_list: ['sensor1'],
                },
                sensors: {
                    sensor1: {}
                },
            };
            scope.rootContainer = { level: 'site', name: 'Site1' };
            compile();

            expect(isolateScope.container.sensors).not.toBeDefined();
            expect(isolateScope.objectDefinition.sensor_list[0]).toBe('sensor1');

            isolateScope.newSensor = {
                name: 'sensor1',
            };
            isolateScope.addSensor();

            // Sensor should be added to container.sensors
            expect(isolateScope.container.sensors[0].type).toBe('sensor1');
            // Sensor should be removed from sensor_list
            expect(isolateScope.objectDefinition.sensor_list.length).toBe(0);

            expect(directive.find('dt').length).toBe(0);
            scope.$digest();
            // Sensor should be added to view
            expect(directive.find('dt').prop('innerHTML')).toBe('sensor1');

            isolateScope.deleteSensor(0);

            // Sensor should be removed to container.sensors
            expect(isolateScope.container.sensors.length).toBe(0);
            // Sensor should be restored to sensor_list
            expect(isolateScope.objectDefinition.sensor_list[0]).toBe('sensor1');
            scope.$digest();
            // Sensor should be removed from view
            expect(directive.find('dt').length).toBe(0);
        });

        it('should add child objects', function () {
            definition = { site: {} };
            scope.rootContainer = { level: 'site', name: 'Site1' };
            compile();

            expect(isolateScope.container.children).not.toBeDefined();

            var newChild = {
                    level: 'building',
                    name: 'Building/WithSlash',
                };
            spyOn(window, 'prompt').andReturn(newChild.name);
            isolateScope.addChild(newChild.level);

            // Building should be added to children, slashes replaced by dashes
            expect(isolateScope.container.children[0].name).toBe('Building-WithSlash');
            expect(isolateScope.container.children[0].level).toBe(newChild.level);

            expect(directive.find('sensor-container').length).toBe(0);
            scope.$digest();
            // Building should be added to view
            expect(directive.find('sensor-container').length).toBe(1);
            expect(directive.find('sensor-container').find('h1').prop('textContent')).toMatch(/^Building: Building-WithSlash/);
        });
    });
});
