angular.module('openeis-ui.filters', [])
.filter('bytes', function() { // Based on https://gist.github.com/thomseddon/3511330
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '--';
        if (typeof precision === 'undefined') precision = 0;
        var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
})
.filter('capitalize', function () {
    return function (input, scope) {
        if (input) {
            return input.substring(0,1).toUpperCase() + input.substring(1);
        }

        return '';
    };
});
