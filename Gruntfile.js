module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    buildDir: 'openeis/ui/static/openeis-ui/',

    clean: {
      build: ['<%= buildDir %>'],
      artifacts: [
        '<%= buildDir %>js/app.js',
        '<%= buildDir %>js/app.templates.js',
      ],
      coverage: ['coverage'],
    },

    concat: {
      build: {
        options: {
          process: function(src) {
            return src.replace(/^\/\/# sourceMappingURL=.+\n/mg, '');
          },
        },
        files: {
          '<%= buildDir %>js/app.min.js': [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-*/angular-*.min.js',
            'bower_components/ng-file-upload/angular-file-upload.min.js',
            '<%= buildDir %>js/app.min.js',
          ],
        }
      },
    },

    htmlbuild: {
      options: {
        relative: true,
      },
      build: {
        src: 'index.html',
        dest: '<%= buildDir %>',
        options: {
          beautify: true,
          scripts: {
            app: '<%= buildDir %>js/app.min.js',
          },
        },
      },
      dev: {
        src: 'index.html',
        dest: '<%= buildDir %>',
        options: {
          scripts: {
            app: [
              '<%= buildDir %>js/angular.js',
              '<%= buildDir %>js/angular*.js',
              '<%= buildDir %>js/autofill-event.js',
              '<%= buildDir %>js/tv4.js',
              '<%= buildDir %>js/*.js',
            ],
          },
        },
      },
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
        preprocessors: {
          'js/!(*.spec).js': ['coverage'],
        },
      },
      dev: {
        background: true,
        singleRun: false,
        reporters: 'progress',
      },
      coverage: {
        background: false,
        singleRun: true,
        reporters: 'coverage',
      },
      ci: {
        background: false,
        singleRun: true,
        reporters: ['coverage', 'junit'],
        coverageReporter: {
          type: 'cobertura',
        },
        junitReporter: {
          outputFile: 'karma-results.xml',
        },
      },
    },

    livereload_snippet: {
      options: {
        before: '</body>',
      },
      src: '<%= buildDir %>index.html',
    },

    ngmin: {
      build: {
        files: {
          '<%= buildDir %>js/app.js': [
            'js/*.js',
            '!js/*.spec.js',
          ]
        },
      },
    },

    ngtemplates: {
      options: {
        module: 'openeis-ui.templates',
        htmlmin: {
          collapseBooleanAttributes:      true,
          collapseWhitespace:             true,
          removeAttributeQuotes:          true,
          // removeComments cannot be true if using comment directives
          removeComments:                 true,
          removeEmptyAttributes:          true,
          removeScriptTypeAttributes:     true,
          removeStyleLinkTypeAttributes:  true,
        },
        standalone: true,
      },
      build: {
        src: 'partials/*.html',
        dest: '<%= buildDir %>js/app.templates.js',
      },
    },

    sass: {
      options: {
        loadPath: ['bower_components'],
      },
      build: {
        options: {
          style: 'compressed',
        },
        files: {
          '<%= buildDir %>css/app.css': 'scss/app.scss',
        },
      },
      dev: {
        options: {
          style: 'nested',
        },
        files: {
          '<%= buildDir %>css/app.css': 'scss/app.scss',
        },
      }
    },

    sync: {
      build: {
        files: [
          {
            src: [
              'settings.js',
              'sensormap-schema.json',
            ],
            dest: '<%= buildDir %>',
          },
        ]
      },
      dev: {
        files: [
          {
            expand: true,
            src: [
              'bower_components/angular*/angular*.js',
              '!bower_components/angular*/angular*.min.js',
              'bower_components/ng-file-upload/angular-file-upload.js',
              'bower_components/autofill-event/src/autofill-event.js',
              'bower_components/tv4/tv4.js',
              'js/*.js',
              '!js/*.spec.js',
            ],
            dest: '<%= buildDir %>js/',
            flatten: true,
          },
        ],
      },
    },

    uglify: {
      build: {
        files: {
          '<%= buildDir %>js/app.min.js': [
            'bower_components/autofill-event/src/autofill-event.js',
            'bower_components/tv4/tv4.js',
            '<%= buildDir %>js/app.js',
            '<%= buildDir %>js/app.templates.js',
          ],
        },
      },
    },

    watch: {
      grunt: { files: ['Gruntfile.js'] },

      livereload: {
        options: { livereload: true },
        files: [
          '<%= buildDir %>index.html',
          '<%= buildDir %>settings.js',
          '<%= buildDir %>css/app.css',
          '<%= buildDir %>js/*.js',
        ],
      },

      html: {
        files: [
          'index.html',
          'js/*.js',
          '!js/*.spec.js',
        ],
        tasks: ['htmlbuild:dev', 'livereload_snippet'],
      },

      sync: {
        files: [
          'settings.js',
          'sensormap-schema.json',
          'js/*.js',
          '!js/*.spec.js',
        ],
        tasks: ['sync'],
      },

      partials: {
        files: ['partials/*.html'],
        tasks: ['ngtemplates'],
      },

      karma: {
        files: ['js/*.js', 'settings.js'],
        tasks: ['karma:dev:run'],
      },

      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass:dev'],
      },
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-livereload-snippet');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-sync');

  grunt.registerTask('build', [
    'clean:build', 'sass:build', 'sync:build', 'ngmin', 'ngtemplates',
    'uglify', 'concat:build', 'htmlbuild:build', 'clean:artifacts',
  ]);

  grunt.registerTask('build-dev', [
    'clean:build', 'sass:dev', 'sync', 'ngtemplates', 'htmlbuild:dev',
  ]);

  grunt.registerTask('coverage', ['clean:coverage', 'karma:coverage']);

  grunt.registerTask('default', [
    'karma:dev:start', 'build-dev', 'livereload_snippet', 'watch',
  ]);
};
