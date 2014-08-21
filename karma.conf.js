module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: [
      // Order of files matter (settings and libraries must be first)
      'src/settings.js',
      'bower_components/d3/d3.min.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-*/angular-*.js',
      'bower_components/ng-file-upload/angular-file-upload.js',
      'bower_components/tv4/tv4.js',
      'src/**/*.js',
      'src/**/*.tpl.html',
    ],
    preprocessors: {
      'src/**/!(*_test).js': ['coverage'],
      'src/**/*.tpl.html': ['ng-html2js'],
    },
    ngHtml2JsPreprocessor: {
      moduleName: 'openeis-ui.templates',
    }
  });
};
