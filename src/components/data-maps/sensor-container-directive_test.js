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
                systems: { System1: {} },
            };
            scope.rootContainer = { level: 'site', name: 'Site1', children: [
                { level: 'building', name: 'Building1' },
                { level: 'building', name: 'Building2' },
                { level: 'building', name: 'Building3', children: [
                    { level: 'system', name: 'System1' },
                ]},
            ]};
            compile();

            // 3 buildings + 1 system
            expect(directive[0].querySelectorAll('sensor-container').length).toBe(4);
            // 1 system
            expect(directive[0].querySelectorAll('sensor-container sensor-container sensor-container').length).toBe(1);
        });

        it('should replace asterisk string with array of all sensors', function () {
            definition = {
                site: { sensor_list: ['sensor2'] },
                building: { sensor_list: '*' },
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

            var siteSensors = directive.find('select')[0].querySelectorAll('option:not([value=""])'),
                buildingSensors = directive.find('select')[1].querySelectorAll('option:not([value=""])');

            expect(siteSensors.length).toBe(1);
            expect(siteSensors[0].innerHTML).toBe('sensor2');

            expect(buildingSensors.length).toBe(3);
            expect(buildingSensors[0].innerHTML).toBe('sensor1');
            expect(buildingSensors[1].innerHTML).toBe('sensor2');
            expect(buildingSensors[2].innerHTML).toBe('sensor3');
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

        it('should add system objects', function () {
            definition = { site: {} };
            scope.rootContainer = { level: 'site', name: 'Site1' };
            compile();

            expect(isolateScope.container.children).not.toBeDefined();

            isolateScope.newSystem = {
                name: 'System1',
            };
            isolateScope.addSystem();

            // System should be added to children
            expect(isolateScope.container.children[0].name).toBe('System1');
            expect(isolateScope.container.children[0].level).toBe('system');

            expect(directive.find('sensor-container').length).toBe(0);
            scope.$digest();
            // System should be added to view
            expect(directive.find('sensor-container').length).toBe(1);
            expect(directive.find('sensor-container').find('h1').prop('textContent')).toMatch(/^System: System1/);
        });

        it('should add child objects', function () {
            definition = { site: {} };
            scope.rootContainer = { level: 'site', name: 'Site1' };
            compile();

            expect(isolateScope.container.children).not.toBeDefined();

            isolateScope.newChild = {
                level: 'building',
                name: 'Building/WithSlash',
            };
            isolateScope.addChild();

            // Building should be added to children, slashes replaced by dashes
            expect(isolateScope.container.children[0].name).toBe('Building-WithSlash');
            expect(isolateScope.container.children[0].level).toBe('building');

            expect(directive.find('sensor-container').length).toBe(0);
            scope.$digest();
            // Building should be added to view
            expect(directive.find('sensor-container').length).toBe(1);
            expect(directive.find('sensor-container').find('h1').prop('textContent')).toMatch(/^Building: Building-WithSlash/);
        });
    });
});
