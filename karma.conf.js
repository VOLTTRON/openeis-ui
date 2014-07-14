module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: [
      // Order of files matter (settings and libraries must be first)
      'src/settings.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-*/angular-*.js',
      'bower_components/ng-file-upload/angular-file-upload.js',
      'bower_components/tv4/tv4.js',
      'js/*.js',
      'partials/*.html',
      'src/**/*.js',
      'src/**/*.tpl.html',
    ],
    preprocessors: {
      'js/!(*.spec).js': ['coverage'],
      'partials/*.html': ['ng-html2js'],
      'src/**/!(*_test).js': ['coverage'],
      'src/**/*.tpl.html': ['ng-html2js'],
    },
    ngHtml2JsPreprocessor: {
      moduleName: 'openeis-ui.templates',
    }
  });
};
