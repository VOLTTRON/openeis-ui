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

describe('DataSetManipulateCtrl controller', function () {
    var $httpBackend, $controller, controller, scope, DataSets, $location, resolve, reject,
        testProject = { id: 1 };

    beforeEach(function () {
        module('openeis-ui');

        module(function($provide) {
            $provide.value('project', testProject);
            $provide.value('dataSet', {});
            $provide.value('DataSetFilters', {
                query: function () { return []; },
            });
        });

        DataSets = {
            manipulate: function () {
                return { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }};
            },
        };

        inject(function (_$httpBackend_, $rootScope, _$controller_, _$location_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            scope = $rootScope.$new();
            scope.project = { id: 1 };
            controller = $controller('DataSetManipulateCtrl', { $scope: scope, DataSets: DataSets });
            $location = _$location_;
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should add and save new filters', function () {
        expect(scope.filters).toEqual({});

        scope.addFilterTo('topic1');

        expect(scope.filters).toEqual({ topic1: [] });
        expect(scope.newFilter).toEqual({ topic: 'topic1' });

        scope.newFilter.filter = { id: 'filter1', parameters: { param1: {} } };
        scope.newFilter.parameters = { param1: 'param1Value' };

        scope.saveNewFilter();

        expect(scope.filters).toEqual({ topic1: [['topic1', 'filter1', { param1: 'param1Value' }]] });
    });

    it('should raise and lower filters', function () {
        scope.filters = { topic1: [
            ['topic1', 'topic1Filter1'],
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter3'],
        ]};

        scope.raiseFilter(scope.filters.topic1[1]);
        scope.lowerFilter(scope.filters.topic1[1]);
        scope.raiseFilter(scope.filters.topic1[0]);
        scope.lowerFilter(scope.filters.topic1[2]);

        expect(scope.filters).toEqual({ topic1: [
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter3'],
            ['topic1', 'topic1Filter1'],
        ]});
    });

    it('should delete filters', function () {
        scope.filters = { topic1: [
            ['topic1', 'topic1Filter1'],
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter3'],
            ['topic1', 'topic1Filter4'],
            ['topic1', 'topic1Filter5'],
        ]};

        scope.deleteFilter(scope.filters.topic1[0]);

        expect(scope.filters).toEqual({ topic1: [
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter3'],
            ['topic1', 'topic1Filter4'],
            ['topic1', 'topic1Filter5'],
        ]});

        scope.deleteFilter(scope.filters.topic1[1]);

        expect(scope.filters).toEqual({ topic1: [
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter4'],
            ['topic1', 'topic1Filter5'],
        ]});

        scope.deleteFilter(scope.filters.topic1[2]);

        expect(scope.filters).toEqual({ topic1: [
            ['topic1', 'topic1Filter2'],
            ['topic1', 'topic1Filter4'],
        ]});
    });

    describe('apply', function () {
        it('should flatten filters', function () {
            spyOn(DataSets, 'manipulate').andReturn({ then: angular.noop });

            scope.filters = {
                'topic1': ['topic1Filter'],
                'topic2': ['topic2Filter'],
            };

            scope.apply();

            expect(DataSets.manipulate).toHaveBeenCalledWith({}, ['topic1Filter', 'topic2Filter']);
        });

        it('should return to project view on success', function () {
            spyOn($location, 'url');

            scope.apply();
            resolve();
            expect($location.url).toHaveBeenCalledWith('projects/' + testProject.id);
        });

        it('should alert user on failure', function () {
            spyOn(window, 'alert');
            spyOn($location, 'url');

            scope.apply();
            reject({ data: ['error1', 'error2'] });
            expect(window.alert).toHaveBeenCalledWith('error1\nerror2');
            expect($location.url).not.toHaveBeenCalled();

            reject({ data: 'error' });
            expect(window.alert).toHaveBeenCalledWith('error');
            expect($location.url).not.toHaveBeenCalled();
        });
    });

    it('should confirm on page leave if and only if filters have been added', function () {
        var confirmSpy = spyOn(window, 'confirm'),
            event;

        scope.filters = { 'topic': [] };

        event = scope.$broadcast('$locationChangeStart');
        expect(window.confirm.callCount).toBe(0);
        expect(event.defaultPrevented).toBe(false);

        scope.filters = { 'topic': ['filter'] };

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
