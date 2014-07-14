describe('openeis-ui.file-upload-directive', function () {
    beforeEach(function () {
        module('openeis-ui.file-upload-directive');
        module('openeis-ui.templates');
    });

    describe('fileUpload directive', function () {
        var $rootScope, directive, fileInput, uploadButton;

        beforeEach(inject(function(_$rootScope_, $compile) {
            $rootScope = _$rootScope_;
            $rootScope.clickFn = function (fileInput) {};
            directive = angular.element('<file-upload file-upload-click="clickFn(fileInput)"></file-upload>');
            $compile(directive)($rootScope);
            $rootScope.$digest();

            fileInput = directive.find('input');
            uploadButton = directive.find('button');
        }));

        describe('file input field', function () {
            it('should exist', function () {
                expect(fileInput.length).toBe(1);
                expect(fileInput.attr('type')).toBe('file');
            });
        });

        describe('upload button', function () {
            it('should exist', function () {
                expect(uploadButton.length).toBe(1);
                expect(uploadButton.prop('innerHTML')).toBe('Upload');
            });

            it('should be initially disabled', function () {
                expect(uploadButton.prop('disabled')).toBe(true);
            });

            it('should call file-upload-click value on click', function () {
                spyOn($rootScope, 'clickFn');
                expect($rootScope.clickFn).not.toHaveBeenCalled();
                uploadButton.triggerHandler('click');
                expect($rootScope.clickFn).toHaveBeenCalled();
            });
        });

        it('should enable/disable upload button when file is attached/detached', function () {
            // TODO: attach file
            // fileInput.triggerHandler('change');
            // expect(uploadButton.prop('disabled')).toBe(false);

            // TODO: detach file
            // fileInput.triggerHandler('change');
            // expect(uploadButton.prop('disabled')).toBe(true);
        });
    });
});
