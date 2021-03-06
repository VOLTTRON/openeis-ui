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

describe('openeis-ui.components.modals', function () {
    beforeEach(function () {
        module('openeis-ui.components.modals');
    });

    describe('modal directive', function () {
        var directive, isolateScope, Modals, modalOpen;

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('Modals', Modals);
            });

            Modals = {
                modalOpen: function () { return true; },
            };

            inject(function($rootScope, $compile) {
                directive = angular.element('<modal><contents></modal>');
                $compile(directive)($rootScope);
                isolateScope = directive.isolateScope();
                isolateScope.$digest();
            });
        });

        it('should have a backdrop', function () {
            expect(directive[0].querySelectorAll('.modal__backdrop').length).toBe(1);
        });

        it('should have a dialog', function () {
            expect(directive[0].querySelectorAll('.modal__dialog').length).toBe(1);
        });

        it('should transclude', function () {
            expect(directive[0].querySelectorAll('contents').length).toBe(1);
        });

        it('should watch and update modal status', inject(function (Modals) {
            expect(isolateScope.modalOpen).toBe(true);
            expect(directive[0].querySelectorAll('contents').length).toBe(1);

            spyOn(Modals, 'modalOpen').andReturn(false);
            isolateScope.$digest();
            expect(Modals.modalOpen).toHaveBeenCalled();
            expect(isolateScope.modalOpen).toBe(false);
            expect(directive[0].querySelectorAll('contents').length).toBe(0);
        }));
    });

    describe('Modals service', function () {
        var Modals;

        beforeEach(inject(function (_Modals_) {
            Modals = _Modals_;
        }));

        it('should open and close modals', function () {
             expect(Modals.modalOpen()).toBe(false);

             Modals.openModal('modal');

             expect(Modals.modalOpen('modal')).toBe(true);
             expect(Modals.modalOpen()).toBe(true);

             Modals.openModal('modal2');

             expect(Modals.modalOpen('modal2')).toBe(true);
             expect(Modals.modalOpen()).toBe(true);

             Modals.closeModal('modal');

             expect(Modals.modalOpen('modal')).toBe(false);
             expect(Modals.modalOpen()).toBe(true);

             Modals.closeModal('modal2');

             expect(Modals.modalOpen('modal2')).toBe(false);
             expect(Modals.modalOpen()).toBe(false);
        });
    });
});
