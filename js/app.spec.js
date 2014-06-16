describe('openeis-ui', function () {
    beforeEach(function () {
        module('openeis-ui');
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
