angular.module('openeis-ui.directives', [])
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
