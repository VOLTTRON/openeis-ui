// -*- coding: utf-8 -*- {{{
// vim: set fenc=utf-8 ft=python sw=4 ts=4 sts=4 et:
//
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
// r favoring by the United States Government or any agency thereof,
// or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the
// United States Government or any agency thereof.
//
// PACIFIC NORTHWEST NATIONAL LABORATORY
// operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
// under Contract DE-AC05-76RL01830

//}}}

describe('openeis-ui.project.configure-timestamp-controller', function () {
    var $httpBackend, controller, scope, DataFiles, $http, resolve, reject;

    beforeEach(function () {
        module('openeis-ui.project.configure-timestamp-controller');

        DataFiles = { update: function () {
            return { then: function (successCallback, errorCallback) {
                resolve = successCallback;
                reject = errorCallback;
            }};
        }};

        $http = function () {
            return { then: function (successCallback, errorCallback) {
                resolve = successCallback;
                reject = errorCallback;
            }};
        };

        inject(function (_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            controller = $controller('ConfigureTimestampCtrl', { $scope: scope, DataFiles: DataFiles, $http: $http });
        });
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
    });

    describe('ConfigureTimestampCtrl controller', function () {
        describe('preview', function () {
            beforeEach(function () {
                scope.timestampFile = { id: 1 };
                scope.modal.columns = { col1: true, col2: false };
                scope.preview();
            });

            it('should alert user on failure', function () {
                spyOn(window, 'alert');
                reject({ data: 'rejection' });
                expect(scope.modal.confirm).toBeFalsy();
                expect(window.alert).toHaveBeenCalled();
            });

            it('should move to confirmation on success', function () {
                resolve({ data: 'preview' });
                expect(scope.modal.confirm).toBe(true);
                expect(scope.modal.timestamps).toBe('preview');
            });
        });

        describe('save', function () {
            beforeEach(function () {
                scope.timestampFile = { id: 1 };
                scope.selectedColumns = [0, 1];
                scope.save();
            });

            it('should alert user on failure', function () {
                spyOn(window, 'alert');
                reject({ data: 'rejection' });
                expect(scope.modal.confirm).toBeFalsy();
                expect(window.alert).toHaveBeenCalled();
            });

            it('should close modal on success', inject(function (Modals) {
                spyOn(Modals, 'closeModal');
                resolve({ data: 'preview' });
                expect(Modals.closeModal).toHaveBeenCalledWith('configureTimestamp');
            }));
        });
    });
});
