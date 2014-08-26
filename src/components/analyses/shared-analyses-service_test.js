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

describe('openeis-ui.analyses.shared-analyses-service', function () {
    var SharedAnalyses, $httpBackend,
        testSharedAnalyses = [
            { id: 1, name: 'Test shared analysis 1' },
            { id: 2, name: 'Test shared analysis 2' },
            { id: 3, name: 'Test shared analysis 3' },
        ];

    beforeEach(function () {
        module('openeis-ui.analyses.shared-analyses-service');

        inject(function (_SharedAnalyses_, _$httpBackend_) {
            SharedAnalyses = _SharedAnalyses_;
            $httpBackend = _$httpBackend_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('SharedAnalyses service', function () {
        it('should get shared analyses by analysis ID and key', function () {
            var sharedAnalysis;

            expect(SharedAnalyses.get).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/' + testSharedAnalyses[0].id + '?key=' + 'abc123').respond(angular.toJson(testSharedAnalyses[0]));
            SharedAnalyses.get(testSharedAnalyses[0].id, 'abc123').$promise.then(function (response) {
                sharedAnalysis = response;
            });
            $httpBackend.flush();

            expect(sharedAnalysis.id).toEqual(testSharedAnalyses[0].id);
            expect(sharedAnalysis.name).toEqual(testSharedAnalyses[0].name);
        });

        it('should query for all shared analyses', function () {
            var sharedAnalyses;

            expect(SharedAnalyses.query).toBeDefined();

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses?project=1').respond(angular.toJson(testSharedAnalyses));
            SharedAnalyses.query(1).$promise.then(function (response) {
                sharedAnalyses = response;
            });
            $httpBackend.flush();

            expect(sharedAnalyses.length).toEqual(testSharedAnalyses.length);

            for (var i = 0; i < testSharedAnalyses.length; i++) {
                expect(sharedAnalyses[i].id).toEqual(testSharedAnalyses[i].id);
                expect(sharedAnalyses[i].name).toEqual(testSharedAnalyses[i].name);
            }
        });

        it('should create new shared analyses', function () {
            var newSharedAnalysis;

            expect(SharedAnalyses.create).toBeDefined();

            $httpBackend.expectPOST(settings.API_URL + 'shared-analyses').respond('{"analysis":1}');
            SharedAnalyses.create(1).$promise.then(function (response) {
                newSharedAnalysis = response;
            });
            $httpBackend.flush();

            expect(newSharedAnalysis.analysis).toBe(1);
        });

        it('should retrieve analysis output data by analysis ID and key', function () {
            var sharedAnalysisData,
                table1Data = [ {x: 't1x1', y: 't1y1'}, {x: 't1x2', y: 't1y2'} ],
                table2Data = [ {x: 't2x1', y: 't2y1'}, {x: 't2x2', y: 't2y2'} ];

            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123').respond(angular.toJson({ 'table1': {}, 'table2': {} }));
            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123&output=table1').respond(angular.toJson(table1Data));
            $httpBackend.expectGET(settings.API_URL + 'shared-analyses/1/data?key=abc123&output=table2').respond(angular.toJson(table2Data));
            SharedAnalyses.getData(1, 'abc123').then(function (data) {
                sharedAnalysisData = data;
            });
            $httpBackend.flush();

            // Compare JSON since .toEqual() doesn't work here for some reason
            // expect(sharedAnalysisData).toEqual({ table1: table1Data, table2: table2Data });
            expect(angular.toJson(sharedAnalysisData)).toBe(angular.toJson({ table1: table1Data, table2: table2Data }));
        });
    });
});
