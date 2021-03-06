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

describe('DataFiles service', function () {
    var DataFiles, $httpBackend,
        headUrlPattern = new RegExp('^' + settings.API_URL + 'files/\\d+/head(\\?rows=\\d+)?$'),
        testDataFiles = [
            { id: 1, name: 'File 1' },
            { id: 2, name: 'File 2' },
            { id: 3, name: 'File 3' },
        ];

    beforeEach(function () {
        module('openeis-ui.services.data-files');

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
        expect(file.name).toEqual(testDataFiles[0].name);
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
            expect(files[i].name).toEqual(testDataFiles[i].name);
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
            head = response;
        });
        $httpBackend.flush();

        expect(head.has_header).toEqual(testHead.has_header);

        for (var i = 0; i < testHead.rows.length; i++) {
            expect(head.rows[i]).toEqual(testHead.rows[i]);
        }
    });

    it('should retrieve preview of parsed timestamps', function () {
        var preview,
            testPreview = [['raw1', 'parse1'], ['raw2', 'parsed2']];

        expect(DataFiles.timestamps).toBeDefined();

        $httpBackend.expectGET(settings.API_URL + 'files/1/timestamps?columns=0&time_offset=0&time_zone=UTC').respond(angular.toJson(testPreview));
        DataFiles.timestamps(1, 0, 'UTC', '0').then(function (response) {
            preview = response;
        });
        $httpBackend.flush();

        expect(preview).toEqual(testPreview);
    });
});
