describe('openeis-ui.projects.files', function () {
    var headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$');

    beforeEach(module('openeis-ui.projects.files'));

    describe('Files service', function () {
        var Files, $httpBackend,
            testFiles = [
                { id: 1, file: 'File 1' },
                { id: 2, file: 'File 2' },
                { id: 3, file: 'File 3' },
            ];

        beforeEach(function () {
            inject(function (_Files_, _$httpBackend_) {
                Files = _Files_;
                $httpBackend = _$httpBackend_;
            });
        });

        it('should get files by file ID that can be saved and deleted', function () {
            var file;

            expect(Files.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'files/' + testFiles[0].id).respond(angular.toJson(testFiles[0]));
            Files.get(testFiles[0].id).then(function (response) {
                file = response;
            });
            $httpBackend.flush();

            expect(file.id).toEqual(testFiles[0].id);
            expect(file.file).toEqual(testFiles[0].file);
            expect(file.$save).toBeDefined();
            expect(file.$delete).toBeDefined();
        });

        it('should query for all files in a project by project ID', function () {
            var files;

            expect(Files.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'files?project=1').respond(angular.toJson(testFiles));
            Files.query(1).then(function (response) {
                files = response;
            });
            $httpBackend.flush();

            expect(files.length).toEqual(testFiles.length);

            for (var i = 0; i < testFiles.length; i++) {
                expect(files[i].id).toEqual(testFiles[i].id);
                expect(files[i].file).toEqual(testFiles[i].file);
            }
        });

        it('should update (rename) files', function () {
            $httpBackend.expectPATCH(settings.API_URL + 'files/' + testFiles[0].id).respond(angular.toJson(testFiles[0]));
            Files.update(testFiles[0]);
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

            expect(Files.head).toBeDefined();

            $httpBackend.expectGET(headUrlPattern).respond(angular.toJson(testHead));
            Files.head(1).then(function (response) {
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
