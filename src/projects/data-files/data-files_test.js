describe('openeis-ui.projects.data-files', function () {
    var headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$');

    beforeEach(module('openeis-ui.projects.data-files'));

    describe('DataFiles service', function () {
        var DataFiles, $httpBackend,
            testDataFiles = [
                { id: 1, file: 'File 1' },
                { id: 2, file: 'File 2' },
                { id: 3, file: 'File 3' },
            ];

        beforeEach(function () {
            inject(function (_DataFiles_, _$httpBackend_) {
                DataFiles = _DataFiles_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should get files by file ID that can be saved and deleted', function () {
            var file;

            expect(DataFiles.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'files/' + testDataFiles[0].id).respond(angular.toJson(testDataFiles[0]));
            DataFiles.get(testDataFiles[0].id).then(function (response) {
                file = response;
            });
            $httpBackend.flush();

            expect(file.id).toEqual(testDataFiles[0].id);
            expect(file.file).toEqual(testDataFiles[0].file);
            expect(file.$save).toBeDefined();
            expect(file.$delete).toBeDefined();
        });

        it('should query for all files in a project by project ID', function () {
            var files;

            expect(DataFiles.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson(testDataFiles));
            DataFiles.query(1).then(function (response) {
                files = response;
            });
            $httpBackend.flush();

            expect(files.length).toEqual(testDataFiles.length);

            for (var i = 0; i < testDataFiles.length; i++) {
                expect(files[i].id).toEqual(testDataFiles[i].id);
                expect(files[i].file).toEqual(testDataFiles[i].file);
            }
        });

        it('should update (rename) files', function () {
            $httpBackend.expectPATCH(settings.API_URL + 'files/' + testDataFiles[0].id).respond(angular.toJson(testDataFiles[0]));
            DataFiles.update(testDataFiles[0]);
            $httpBackend.flush();
        });

        it('should retrieve the first rows of a file by file ID', function () {
            var head,
                testHead = {
                    has_header: true,
                    rows: [
                        [ 'Col1', 'Col2', 'Col3' ],
                        [ '1-1', '1-2', '1-3' ],
                        [ '2-1', '2-2', '2-3' ],
                        [ '3-1', '3-2', '3-3' ],
                    ],
                };

            expect(DataFiles.head).toBeDefined();

            $httpBackend.expectGET(headUrlPattern).respond(angular.toJson(testHead));
            DataFiles.head(1).then(function (response) {
                head = response.data;
            });
            $httpBackend.flush();

            expect(head.has_header).toEqual(testHead.has_header);

            for (var i = 0; i < testHead.rows.length; i++) {
                expect(head.rows[i]).toEqual(testHead.rows[i]);
            }
        });
    });

    describe('hasSignature filter', function () {
        it('should only return files matching specified signature', inject(function (hasSignatureFilter) {
            var signature = 'signature',
                fileWith = { signature: 'signature' },
                fileWithout = { signature: 'notsignature' };

            expect(hasSignatureFilter([fileWith], signature)).toEqual([fileWith]);
            expect(hasSignatureFilter([fileWithout], signature)).toEqual([]);
        }));
    });

    describe('hasTimestamp filter', function () {
        it('should only return files with timestamp configurations', inject(function (hasTimestampFilter) {
            var fileWith = { timestamp: true },
                fileWithout = {};

            expect(hasTimestampFilter([fileWith])).toEqual([fileWith]);
            expect(hasTimestampFilter([fileWithout])).toEqual([]);
        }));
    });
})
