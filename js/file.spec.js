describe('openeis-ui.file', function () {
    beforeEach(function () {
        module('openeis-ui.file');
        module('openeis-ui.templates');
    });

    describe('fileUpload directive', function () {
        var directive;

        beforeEach(inject(function($rootScope, $compile) {
            directive = angular.element('<file-upload></file-upload>');
            $compile(directive)($rootScope);
            $rootScope.$digest();
        }));

        describe('file input field', function () {
            it('should exist', function () {
                expect(directive[0].querySelectorAll('input[type="file"]').length).toBe(1);
            });
        });

        describe('upload button', function () {
            var button;

            beforeEach(function () {
                button = directive[0].querySelectorAll('button');
            });

            it('should exist', function () {
                expect(button.length).toBe(1);
                expect(button[0].innerHTML).toBe('Upload');
            });

            it('should be initially disabled', function () {
                expect(button[0].disabled).toBe(true);
            });

            it('should become enabled/disbaled when file is attached/detached', function () {
                // TODO
            });

            it('should call value of file-upload-click attribute when clicked', function () {
                // TODO
            });
        });
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
});
