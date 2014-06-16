module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: [
      'settings.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-*/angular-*.js',
      'bower_components/ng-file-upload/angular-file-upload.js',
      'bower_components/tv4/tv4.js',
      'js/*.js',
      'partials/*.html',
    ],
  });
};
