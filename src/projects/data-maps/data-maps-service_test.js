describe('openeis-ui.projects.data-maps.data-maps-service', function () {
    describe('DataMaps service', function () {
        var headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$'),
            testDataMaps = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
            ],
            DataMaps, $httpBackend;

        beforeEach(function () {
            module('openeis-ui.projects.data-maps.data-maps-service');

            inject(function (_DataMaps_, _$httpBackend_) {
                DataMaps = _DataMaps_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should query for all data maps in a project by project ID', function () {
            var dataMaps;

            $httpBackend.expectGET(settings.API_URL + 'sensormaps?project=1').respond(angular.toJson(testDataMaps));
            dataMaps = DataMaps.query(1);
            $httpBackend.flush();

            expect(dataMaps.length).toEqual(testDataMaps.length);

            for (var i = 0; i < testDataMaps.length; i++) {
                expect(dataMaps[i].id).toEqual(testDataMaps[i].id);
            }
        });

        it('should create data maps from non-flattened data maps', function () {
            var newDataMap = { map: { sensors: [] } },
                result;

            spyOn(DataMaps, 'flattenMap').andReturn('flattenedMap');

            $httpBackend.expectPOST(settings.API_URL + 'sensormaps', '{"map":"flattenedMap"}').respond('');
            DataMaps.create(newDataMap);
            $httpBackend.flush();
        });

        it('should retrieve the data map defintion object', function () {
            $httpBackend.expectGET(settings.GENERAL_DEFINITION_URL).respond('');
            DataMaps.getDefinition();
            $httpBackend.flush();
        });

        it('should retrieve the data map units object', function () {
            $httpBackend.expectGET(settings.UNITS_URL).respond('');
            DataMaps.getUnits();
            $httpBackend.flush();
        });

        describe('flattenMap method', function () {
            it('should flatten data map objects into topics', function () {
                var map = {
                        sensors: [
                            { name: 'Site1', children: [
                                { name: 'Building1', children: [
                                    { name: 'System1', sensors: [
                                        { name: 'SensorA' },
                                        { name: 'SensorB' },
                                    ]},
                                ]},
                                { name: 'Building2' },
                            ]},
                            { name: 'Building3', sensors: [
                                { name: 'SensorB' },
                                { name: 'SensorC' },
                            ]},
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.sensors).toEqual({
                    'Site1': {},
                    'Site1/Building1': {},
                    'Site1/Building1/System1': {},
                    'Site1/Building1/System1/SensorA': {},
                    'Site1/Building1/System1/SensorB': {},
                    'Site1/Building2': {},
                    'Building3': {},
                    'Building3/SensorB': {},
                    'Building3/SensorC': {},
                });
            });

            it('should set the files property', function () {
                var files = {
                        File1: {
                            file: 'File1',
                            hasHeader: true,
                            columns: ['Timestamp', 'Value'],
                            signature: 'file1signature',
                            timestamp: 'file1timestamp',
                        },
                        File2: {
                            file: 'File2',
                            hasHeader: false,
                            columns: ['Column 1', 'Column 2', 'Column 3'],
                            signature: 'file2signature',
                            timestamp: 'file2timestamp',
                        },
                    },
                    map = {
                        sensors: [
                            { name: 'Building1', sensors: [
                                {
                                    name: 'SensorA',
                                    file: files.File1,
                                    column: 1,
                                },
                                {
                                    name: 'SensorB',
                                    file: files.File2,
                                    column: '1'
                                },
                                {
                                    name: 'SensorC',
                                    file: files.File2,
                                    column: '2'
                                },
                            ]},
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.files).toEqual({
                    '0': {
                        signature: files.File1.signature,
                        timestamp: files.File1.timestamp,
                    },
                    '1': {
                        signature: files.File2.signature,
                        timestamp: files.File2.timestamp,
                    },
                });

                expect(flattenedMap.sensors['Building1/SensorA'].file).toEqual('0');
                expect(flattenedMap.sensors['Building1/SensorB'].file).toEqual('1');
                expect(flattenedMap.sensors['Building1/SensorC'].file).toEqual('1');
            });

            it('should not include deleted objects', function () {
                var map = {
                        sensors: [
                            { name: 'Site1', children: [
                                { name: 'Building1', deleted: true },
                                { name: 'Building2', sensors: [
                                    { name: 'SensorA', deleted: false },
                                    { name: 'SensorB', deleted: true },
                                ]},
                            ]},
                            { name: 'Site2', deleted: true },
                            { name: 'Site3', deleted: false },
                        ],
                    },
                    flattenedMap = DataMaps.flattenMap(map);

                expect(flattenedMap.sensors).toEqual({
                    'Site1': {},
                    'Site1/Building2': {},
                    'Site1/Building2/SensorA': {},
                    'Site3': {},
                });
            });
        });

        describe('validateMap method', function () {
            it('validate data maps against JSON schema', function () {
                // TODO
            });
        });

        describe('ensureFileMetaData method', function () {
            it('should create file signatures for files with headers', function () {
                var files = [
                        { id: 1 },
                        { id: 2, signature: true },
                        { id: 3, signature: true, columns: true },
                    ];

                $httpBackend.whenGET(headUrlPattern).respond(200, angular.toJson({
                    has_header: true,
                    rows: [
                        ['header1', 'header2', 'header3'],
                    ],
                }));
                DataMaps.ensureFileMetaData(files);
                $httpBackend.flush();

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toEqual(['header1', 'header2', 'header3']);
                    expect(file.hasHeader).toBe(true);
                    expect(file.signature).toEqual({ headers: file.columns });
                });
            });

            it('should create file signatures for files without headers', function () {
                var files = [
                        { id: 1 },
                        { id: 2, signature: true },
                        { id: 3, signature: true, columns: true },
                    ];

                $httpBackend.whenGET(headUrlPattern).respond(200, angular.toJson({
                    has_header: false,
                    rows: [
                        ['value1', 'value2', 'value3'],
                    ],
                }));
                DataMaps.ensureFileMetaData(files);
                $httpBackend.flush();

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toEqual(['Column 1', 'Column 2', 'Column 3']);
                    expect(file.hasHeader).toBe(false);
                    expect(file.signature).toEqual({ headers: [null, null, null] });
                });
            });

            it('should skip files with signature, columns, and hasHeader properties', function () {
                var files = [
                        { id: 1, signature: true, columns: true, hasHeader: false },
                        { id: 2, signature: true, columns: true, hasHeader: false },
                        { id: 3, signature: true, columns: true, hasHeader: false },
                    ];

                // No API call should be made
                DataMaps.ensureFileMetaData(files);

                angular.forEach(files, function (file, k) {
                    expect(file.columns).toBe(true);
                    expect(file.hasHeader).toBe(false);
                    expect(file.signature).toBe(true);
                });
            });
        });
    });
});
