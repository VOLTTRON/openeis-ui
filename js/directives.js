angular.module('openeis-ui.directives', [])
.directive('fileUpload', function ($parse) {
    return {
        restrict: 'E',
        template: '<input type="file"><button disabled>Upload</button>',
        compile: function(tElement, tAttr) {
            clickFn = $parse(tAttr.fileUploadClick);

            return function (scope, element, attr) {
                var fileInput = element.find('input'),
                    uploadButton = element.find('button');

                fileInput.on('change', function () {
                    if (fileInput[0].files.length) {
                        uploadButton.prop('disabled', false);
                    } else {
                        uploadButton.prop('disabled', true);
                    }
                });

                uploadButton.on('click', function (event) {
                    scope.$apply(function () {
                        clickFn(scope, {
                            $event: event,
                            fileInput: fileInput,
                        });
                    });
                });
            };
        },
    };
})
.directive('inputType', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (element[0].nodeName !== 'INPUT') {
                return;
            }

            var types = $parse(attrs.inputType)(scope);

            for (var type in types) {
                if (types[type] === true) {
                    element.attr('type', type);
                    break;
                }
            }
        },
    };
});
