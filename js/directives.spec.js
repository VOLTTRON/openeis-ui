describe('openeis-ui.directives', function () {
    beforeEach(function () {
        module('openeis-ui.directives');
    });

    describe('inputType directive', function () {
        var $rootScope, $compile, scope, directive;

        beforeEach(inject(function(_$rootScope_, _$compile_) {
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            scope = $rootScope.$new();
            $compile(directive)($rootScope);
            $rootScope.$digest();
        }));

        it('should set type attribute of input elements', function () {
            scope.textType = false;
            scope.emailType = true;
            directive = angular.element('<input input-type="{ text: textType, email: emailType }">');
            $compile(directive)(scope);
            $rootScope.$digest();
            expect(directive.attr('type')).toBe('email');
        });

        it('should override existing type attribute', function () {
            scope.textType = true;
            directive = angular.element('<input type="email" input-type="{ text: textType }">');
            $compile(directive)(scope);
            $rootScope.$digest();
            expect(directive.attr('type')).toBe('text');
        });

        it('should ignore all elements other than input', function () {
            scope.textType = true;
            directive = angular.element('<select input-type="{ text: textType }"></select>');
            $compile(directive)(scope);
            $rootScope.$digest();
            expect(directive.attr('type')).not.toBeDefined();
        });
    });
});
