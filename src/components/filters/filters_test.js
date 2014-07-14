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
