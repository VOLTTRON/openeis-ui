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

describe('openeis-ui.signup', function () {
    var Auth;

    beforeEach(function () {
        module('openeis-ui');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });
    });

    describe('SignUpCtrl controller', function () {
        var controller, scope, createResolve, createReject, logInStatus;

        beforeEach(function () {
            Auth = {
                accountCreate: function () {
                    return { then: function (successCallback, errorCallback) {
                        createResolve = successCallback;
                        createReject = errorCallback;
                    }};
                },
                logIn: function () {
                    return { catch: function (callback) {
                        callback({ status: logInStatus });
                    }};
                },
            };

            inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();
                controller = $controller('SignUpCtrl', { $scope: scope });
            });
        });

        describe('submit method', function () {
            it('should check for matching passwords', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'differentpassword',
                };
                expect(scope.form.passwordConfirm).not.toBeDefined();

                scope.submit();
                expect(scope.form.passwordConfirm).toBeTruthy();
            });

            it('should pass Auth.accountCreate error status to view', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                createReject({ status: 403 });
                expect(scope.form.error.status).toBe(403);

                scope.submit();
                createReject({ status: 500 });
                expect(scope.form.error.status).toBe(500);
            });

            it('should flatten validation errors', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                scope.submit();
                createReject({
                    status: 400,
                    data: {
                        field1: ['error1', 'error2'],
                        field2: 'error1',
                    },
                });
                expect(scope.form.error.status).toBe(400);
                expect(scope.form.error.data.field1).toBe('error1<br>error2');
                expect(scope.form.error.data.field2).toBe('error1');
            });

            it('should log in on successful account creation', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                spyOn(Auth, 'logIn').andCallThrough();
                expect(Auth.logIn).not.toHaveBeenCalled();

                scope.submit();
                createResolve();
                expect(Auth.logIn).toHaveBeenCalled();
            });

            it('should not log in on failed account creation', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                spyOn(Auth, 'logIn').andCallThrough();
                scope.submit();
                createReject({ status: 500 });
                expect(Auth.logIn).not.toHaveBeenCalled();
            });

            it('should pass Auth.logIn error status to view', function () {
                scope.account = {
                    username: 'TestUser',
                    password: 'testpassword',
                    passwordConfirm: 'testpassword',
                };
                expect(scope.form.error).not.toBeDefined();

                logInStatus = 403;
                scope.submit();
                createResolve();
                expect(scope.form.error).toBe(403);

                logInStatus = 500;
                scope.submit();
                createResolve();
                expect(scope.form.error).toBe(500);
            });
        });

        describe('clearError method', function () {
            it('should clear errors', function () {
                scope.form.error = 'error';
                scope.clearError();
                expect(scope.form.error).toBeFalsy();
            });
        });
    });
});
