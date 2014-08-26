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

describe('openeis-ui.recovery', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui.recovery');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('RecoveryCtrl controller', function () {
        var $controller, controller, scope, resolve, reject;

        beforeEach(function () {
            Auth = {
                accountRecover1: function () {
                    return {
                        then: function (successCallback, errorCallback) {
                            resolve = successCallback;
                            reject = errorCallback;
                        },
                    };
                },
                accountRecover2: function () {
                    return {
                        then: function (successCallback, errorCallback) {
                            resolve = successCallback;
                            reject = errorCallback;
                        },
                    };
                },
            };

            inject(function ($rootScope, _$controller_) {
                scope = $rootScope.$new();
                $controller = _$controller_;
            });
        });

        it('should default to stage 1', function () {
            controller = $controller('RecoveryCtrl', { $scope: scope });
            expect(scope.form.stage).toBe(1);
        });

        it('should go to stage 2 if username and code are provided', function () {
            routeParams = {
                username: 'TestUser',
                code: 'testcode',
            };
            controller = $controller('RecoveryCtrl', { $scope: scope, $routeParams: routeParams });
            expect(scope.form.stage).toBe(2);
            expect(scope.recovery).toEqual({
                username: routeParams.username,
                code: routeParams.code,
            });
        });

        describe('submit method stage 1', function () {
            beforeEach(function () {
                controller = $controller('RecoveryCtrl', { $scope: scope });
            });

            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();
                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });
                expect(scope.form.error.status).toBe(404);

                scope.submit();
                reject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });
        });

        describe('submit method stage 2', function () {
            beforeEach(function () {
                controller = $controller('RecoveryCtrl', { $scope: scope });
                scope.form.stage = 2;
            });

            it('should detect non-matching passwords', function () {
                scope.recovery = {
                    password: 'password',
                    passwordConfirm: 'differentpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                expect(scope.form.error.status).toBe(400);
            });

            it('should pass success and error responses to view', function () {
                expect(scope.form.success).not.toBeDefined();
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                resolve();
                expect(scope.form.success).toBeTruthy();

                scope.submit();
                reject({ status: 404 });
                expect(scope.form.error.status).toBe(404);

                scope.submit();
                reject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });
        });
    });
});
