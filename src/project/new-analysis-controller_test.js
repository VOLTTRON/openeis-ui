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

describe('openeis-ui.project.new-analysis-controller', function () {
    var $httpBackend, controller, scope, DataMaps, Applications;
    var testMap = { map: { sensors: {
        'object': {},
        'object/sensor1': { type: 'typeA' },
        'object/sensor2': { type: 'typeA' },
        'object/sensor3': { type: 'typeB' },
    }}};
    var testApps = [{
        name: 'app1',
        inputs: {
            input1: {
                sensor_type: 'typeA',
                count_min: 2,
                count_max: 2,
            },
        },
    }, {
        name: 'app2',
        inputs: {
            input1: {
                sensor_type: 'typeB',
                count_min: 2,
                count_max: null,
            },
        },
    }, {
        name: 'app3',
        inputs: {
            input1: {
                sensor_type: 'typeC',
                count_min: 1,
                count_max: 3,
            }
        },
    }];

    beforeEach(function () {
        module('openeis-ui.project.new-analysis-controller');

        inject(function (_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            controller = $controller('NewAnalysisCtrl', { $scope: scope });

            $httpBackend.expectGET(settings.API_URL + 'sensormaps/1').respond(angular.toJson(testMap));
            $httpBackend.expectGET(settings.API_URL + 'applications').respond(angular.toJson(testApps));
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('NewAnalysisCtrl controller', function () {
        describe('upon data set selection', function () {
            beforeEach(function () {
                scope.newAnalysis.dataSet = { map: 1 };
            });

            it('should create list of available sensors', function () {
                expect(scope.availableSensors).not.toBeDefined();
                scope.$digest();
                $httpBackend.flush();
                expect(scope.availableSensors.typeA.length).toBe(2);
                expect(scope.availableSensors.typeB.length).toBe(1);
                expect(scope.availableSensors.typeC).not.toBeDefined();
            });

            it('should determine application compatibility', function () {
                expect(scope.availableApps).not.toBeDefined();
                scope.$digest();
                $httpBackend.flush();
                expect(scope.availableApps[0].missingInputs).not.toBeDefined();
                expect(scope.availableApps[1].missingInputs.length).toBe(1);
                expect(scope.availableApps[2].missingInputs.length).toBe(1);
            });

            describe('and application selection', function () {
                var blankAppConfig = { parameters: {}, inputs: { input1: [{}, {}] } };

                beforeEach(function () {
                    scope.$digest();
                    scope.newAnalysis.application = testApps[0];
                });

                it('should create empty configuration', function () {
                    expect(scope.newAnalysis.configuration).not.toBeDefined();
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);
                });

                it('should preserve configuration if same application is re-selected', function () {
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);

                    var testConfig = {
                        parameters: { param1: 'value1', param2: 'value2' },
                        inputs: { input1: 'value1', input2: 'value2' },
                    };
                    scope.newAnalysis.configuration = testConfig;
                    scope.newAnalysis.application = null;
                    scope.$digest();
                    scope.newAnalysis.application = testApps[0];
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toBe(testConfig);

                    scope.newAnalysis.application = testApps[1];
                    scope.$digest();
                    expect(scope.newAnalysis.configuration).toEqual(blankAppConfig);
                });
            });
        });
    });
});
