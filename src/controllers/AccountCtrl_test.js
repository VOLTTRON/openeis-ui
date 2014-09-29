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

describe('AccountCtrl controller', function () {
    var Auth, $controller, controller, scope, accountResponse;

    beforeEach(function () {
        module('openeis-ui');

        module(function ($provide) {
            $provide.value('Auth', Auth);
        });

        Auth = {
            account: function () {
                return { then: function (callback) {
                    callback(accountResponse);
                }};
            },
        };

        inject(function ($rootScope, _$controller_) {
            $controller = _$controller_;
            scope = $rootScope.$new();
            controller = $controller('AccountCtrl', { $scope: scope });
        });
    });

    it('should retrieve account', function () {
        accountResponse = {};
        controller = $controller('AccountCtrl', { $scope: scope });
        expect(scope.account).toBe(accountResponse);
    });

    it('should detect profile name changes', function () {
        accountResponse = { first_name: 'TestName' };
        controller = $controller('AccountCtrl', { $scope: scope });
        scope.$digest();
        expect(scope.profile.changed).toBe(false);

        scope.account.first_name = 'NewName';
        scope.$digest();
        expect(scope.profile.changed).toBe(true);

        scope.account.first_name = 'TestName';
        scope.$digest();
        expect(scope.profile.changed).toBe(false);
    });

    it('should detect profile email changes', function () {
        accountResponse = { email: 'TestEmail' };
        controller = $controller('AccountCtrl', { $scope: scope });
        scope.$digest();
        expect(scope.profile.changed).toBe(false);

        scope.account.email = 'NewEmail';
        scope.$digest();
        expect(scope.profile.changed).toBe(true);

        scope.account.email = 'TestEmail';
        scope.$digest();
        expect(scope.profile.changed).toBe(false);
    });

    describe('profile update method', function () {
        var resolve, reject;

        beforeEach(function () {
            Auth.accountUpdate = function () {
                return { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }};
            };
        });

        it('should clear alerts and call Auth.accountUpdate', function () {
            spyOn(scope.profile, 'clearAlerts').andCallThrough();
            spyOn(Auth, 'accountUpdate').andCallThrough();
            expect(scope.profile.clearAlerts).not.toHaveBeenCalled();
            expect(Auth.accountUpdate).not.toHaveBeenCalled();

            scope.profile.update();
            expect(scope.profile.clearAlerts).toHaveBeenCalled();
            expect(Auth.accountUpdate).toHaveBeenCalled();
        });

        it('should update accountOrig on successful update', function () {
            accountResponse = {
                first_name: 'TestName',
                email: 'TestEmail',
            };
            controller = $controller('AccountCtrl', { $scope: scope });
            scope.$digest();
            expect(scope.account).toBe(accountResponse);
            expect(scope.profile.changed).toBe(false);

            scope.account.first_name = 'NewName';
            scope.account.email = 'NewEmail';
            scope.$digest();
            expect(scope.profile.changed).toBe(true);

            scope.profile.update();
            resolve();

            scope.account.first_name = 'NewName2';
            scope.account.email = 'NewEmail2';
            scope.$digest();
            expect(scope.profile.changed).toBe(true);

            scope.account.first_name = 'NewName';
            scope.account.email = 'NewEmail';
            scope.$digest();
            expect(scope.profile.changed).toBe(false);
        });

        it('should pass error to view on failed update', function () {
            var rejection = { status: 500 };
            expect(scope.profile.error).not.toBeDefined();

            scope.profile.update();
            reject(rejection);
            expect(scope.profile.error).toBe(rejection);
        });

        it('should flatten validation errors', function () {
            var rejection = {
                status: 400,
                data: {
                    field1: ['error1', 'error2'],
                    field2: 'error1',
                },
            };
            expect(scope.profile.error).not.toBeDefined();

            scope.profile.update();
            reject(rejection);
            expect(scope.profile.error.status).toBe(rejection.status);
            expect(scope.profile.error.data.field1).toBe('error1<br>error2');
            expect(scope.profile.error.data.field2).toBe('error1');
        });
    });

    describe('password update method', function () {
        var resolve, reject;

        beforeEach(function () {
            Auth.accountPassword = function () {
                return { then: function (successCallback, errorCallback) {
                    resolve = successCallback;
                    reject = errorCallback;
                }};
            };
        });

        it('should clear alerts and call Auth.accountPassword', function () {
            spyOn(scope.password, 'clearAlerts').andCallThrough();
            spyOn(Auth, 'accountPassword').andCallThrough();
            expect(scope.password.clearAlerts).not.toHaveBeenCalled();
            expect(Auth.accountPassword).not.toHaveBeenCalled();

            scope.password.update();
            expect(scope.password.clearAlerts).toHaveBeenCalled();
            expect(Auth.accountPassword).toHaveBeenCalled();
        });

        it('should check for matching passwords', function () {
            scope.password.new = 'password';
            scope.password.newConfirm = 'password';
            expect(scope.password.mismatch).not.toBeDefined();

            scope.password.update();
            expect(scope.password.mismatch).toBe(false);

            scope.password.newConfirm = 'differentpassword';
            scope.password.update();
            expect(scope.password.mismatch).toBe(true);
        });

        it('should clear values on successful update', function () {
            scope.password.current = 'currentpassword';
            scope.password.new = 'newpassword';
            scope.password.newConfirm = 'newpassword';

            scope.password.update();
            resolve();

            expect(scope.password.current).toBe('');
            expect(scope.password.new).toBe('');
            expect(scope.password.newConfirm).toBe('');
        });

        it('should pass error to view on failed update', function () {
            var rejection = { status: 500 };
            expect(scope.password.error).not.toBeDefined();

            scope.password.update();
            reject(rejection);
            expect(scope.password.error).toBe(rejection);
        });

        it('should flatten validation errors', function () {
            var rejection = {
                status: 400,
                data: {
                    field1: ['error1', 'error2'],
                    field2: 'error1',
                },
            };
            expect(scope.password.error).not.toBeDefined();

            scope.password.update();
            reject(rejection);
            expect(scope.password.error.status).toBe(rejection.status);
            expect(scope.password.error.data.field1).toBe('error1<br>error2');
            expect(scope.password.error.data.field2).toBe('error1');
        });
    });
});
