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
});
