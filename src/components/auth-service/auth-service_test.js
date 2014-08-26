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

describe('openeis-ui.auth-service', function () {
    var accountResourceUrl = settings.API_URL + 'account',
        loginResourceUrl = settings.API_URL + 'account/login',
        pwChangeResourceUrl = settings.API_URL + 'account/change_password',
        pwResetResourceUrl = settings.API_URL + 'account/password_reset';

    beforeEach(function () {
        module('openeis-ui.auth-service');
    });

    describe('Auth service', function () {
        var Auth, $httpBackend, $location;

        beforeEach(function () {
            inject(function (_Auth_, _$httpBackend_, _$location_) {
                Auth = _Auth_;
                $httpBackend = _$httpBackend_;
                $location = _$location_;
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
        });

        describe('account method', function () {
            it('should only call the API once', function () {
                var account;

                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (response) {
                    account = response;
                });
                expect(account).toEqual(null);
                $httpBackend.flush();
                expect(account.username).toEqual('TestUser');

                // No API call second time around
                Auth.account();
            });

            it('should return false if not authenticated', function () {
                var account;

                $httpBackend.expectGET(accountResourceUrl).respond(403, '');
                Auth.account().then(function (response) {
                    account = response;
                });
                expect(account).toEqual(null);
                $httpBackend.flush();
                expect(account).toEqual(false);
            });
        });

        describe('accountCreate method', function () {
            it('should create accounts', function () {
                var newAccount = { username: 'newUser' };

                $httpBackend.expectPOST(accountResourceUrl, angular.toJson(newAccount)).respond(204, '');
                Auth.accountCreate(newAccount);
                $httpBackend.flush();
            });
        });

        describe('accountUpdate method', function () {
            it('should update accounts', function () {
                var newInfo = { email: 'newEmail' };

                $httpBackend.expectPATCH(accountResourceUrl, angular.toJson(newInfo)).respond(204, '');
                Auth.accountUpdate(newInfo);
                $httpBackend.flush();
            });
        });

        describe('accountPassword method', function () {
            it('should change account passwords', function () {
                var password = { old_password: 'old', new_password: 'new' };

                $httpBackend.expectPOST(pwChangeResourceUrl, angular.toJson(password)).respond(204, '');
                Auth.accountPassword(password);
                $httpBackend.flush();
            });
        });

        describe('accountRecover1 method', function () {
            it('should POST account ID', function () {
                $httpBackend.expectPOST(pwResetResourceUrl, '{"username_or_email":"TestUser"}').respond(204, '');
                Auth.accountRecover1('TestUser');
                $httpBackend.flush();
            });
        });

        describe('accountRecover2 method', function () {
            it('should PUT account recovery parameters', function () {
                var params = {
                    username: 'TestUser',
                    code: 'testcode',
                    password: 'testpassword',
                };

                $httpBackend.expectPUT(pwResetResourceUrl, angular.toJson(params)).respond(204, '');
                Auth.accountRecover2(params);
                $httpBackend.flush();
            });
        });

        describe('loginRedirect method', function () {
            it('should exist', function () {
                expect(Auth.loginRedirect).toBeDefined();
            });
        });

        describe('logIn method', function () {
            it('should only try to update the account property if successful', function () {
                $httpBackend.expectPOST(loginResourceUrl).respond(403, '');
                // No API call to retrieve account details
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                // API call to retrieve account details
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();
            });

            it('should redirect to AUTH_HOME if successful', function () {
                $location.url(settings.LOGIN_PAGE);
                expect($location.url()).toEqual(settings.LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(settings.AUTH_HOME);
            });

            it('should redirect to loginRedirect if set', function () {
                var LOGIN_REDIRECT = '/after/login/path';

                Auth.loginRedirect(LOGIN_REDIRECT);

                $location.url(settings.LOGIN_PAGE);
                expect($location.url()).toEqual(settings.LOGIN_PAGE);

                $httpBackend.expectPOST(loginResourceUrl).respond(204, '');
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.logIn({ username: 'TestUser', password: 'testpassword' });
                $httpBackend.flush();

                expect($location.url()).toEqual(LOGIN_REDIRECT);
            });
        });

        describe('logOut method', function () {
            it('should update the username property if successful', function () {
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();
                $httpBackend.flush();

                Auth.account().then(function (account) {
                    expect(account).toEqual(false);
                });
            });

            it('should not update the username property if unsuccessful', function () {
                $httpBackend.expectGET(accountResourceUrl).respond('{"username":"TestUser"}');
                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
                $httpBackend.flush();

                $httpBackend.expectDELETE(loginResourceUrl).respond(500, '');
                Auth.logOut();
                $httpBackend.flush();

                Auth.account().then(function (account) {
                    expect(account.username).toEqual('TestUser');
                });
            });

            it('should redirect to LOGIN_PAGE if successful', function () {
                $location.url(settings.AUTH_HOME);
                expect($location.url()).toEqual(settings.AUTH_HOME);

                $httpBackend.expectDELETE(loginResourceUrl).respond(204, '');
                Auth.logOut();
                $httpBackend.flush();

                expect($location.url()).toEqual(settings.LOGIN_PAGE);
            });
        });
    });
});
