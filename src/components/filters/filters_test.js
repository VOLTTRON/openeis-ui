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

describe('openeis-ui.filters', function () {
    beforeEach(function () {
        module('openeis-ui.filters');
    });

    describe('bytes filter', function () {
        var bytesFilter;

        beforeEach(inject(function (_bytesFilter_) {
            bytesFilter = _bytesFilter_;
        }));

        it('should convert numeric values to bytes', function () {
            expect(bytesFilter(1)).toBe('1 B');
            expect(bytesFilter(1024)).toBe('1 KB');
            expect(bytesFilter(1024 * 1024)).toBe('1 MB');
            expect(bytesFilter(1024 * 1024 * 1024)).toBe('1 GB');
        });

        it('should accept an optional precision argument', function () {
            expect(bytesFilter(1024 * 1.1111)).toBe('1 KB');
            expect(bytesFilter(1024 * 1.1111, 0)).toBe('1 KB');
            expect(bytesFilter(1024 * 1.1111, 1)).toBe('1.1 KB');
            expect(bytesFilter(1024 * 1.1111, 2)).toBe('1.11 KB');
            expect(bytesFilter(1024 * 1.1111, 4)).toBe('1.1111 KB');
        });

        it('should convert un-parseFloat-able values to "--"', function () {
            expect(bytesFilter('123 MB')).toBe('--');
            expect(bytesFilter(false)).toBe('--');
            expect(bytesFilter(null)).toBe('--');
        });
    });

    describe('capitalize filter', function () {
        it('should capitalize the first letter of strings', inject(function (capitalizeFilter) {
            expect(capitalizeFilter('word')).toEqual('Word');
            expect(capitalizeFilter('multiple words')).toEqual('Multiple words');
            expect(capitalizeFilter('Already capitalized')).toEqual('Already capitalized');
            expect(capitalizeFilter('second Word')).toEqual('Second Word');
            expect(capitalizeFilter('123abc')).toEqual('123abc');
            expect(capitalizeFilter('')).toEqual('');
            expect(capitalizeFilter(null)).toEqual('');
        }));
    });
});
