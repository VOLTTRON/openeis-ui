// -*- coding: utf-8 -*- {{{
// vim: set fenc=utf-8 ft=python sw=4 ts=4 sts=4 et:
//
// Copyright (c) 2014, Battelle Memorial Institute
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.
//

// This material was prepared as an account of work sponsored by an
// agency of the United States Government.  Neither the United States
// Government nor the United States Department of Energy, nor Battelle,
// nor any of their employees, nor any jurisdiction or organization
// that has cooperated in the development of these materials, makes
// any warranty, express or implied, or assumes any legal liability
// or responsibility for the accuracy, completeness, or usefulness or
// any information, apparatus, product, software, or process disclosed,
// or represents that its use would not infringe privately owned rights.
//
// Reference herein to any specific commercial product, process, or
// service by trade name, trademark, manufacturer, or otherwise does
// not necessarily constitute or imply its endorsement, recommendation,
// r favoring by the United States Government or any agency thereof,
// or Battelle Memorial Institute. The views and opinions of authors
// expressed herein do not necessarily state or reflect those of the
// United States Government or any agency thereof.
//
// PACIFIC NORTHWEST NATIONAL LABORATORY
// operated by BATTELLE for the UNITED STATES DEPARTMENT OF ENERGY
// under Contract DE-AC05-76RL01830

//}}}

module.exports = function(grunt) {
  require('jit-grunt')(grunt, {
    htmlbuild: 'grunt-html-build',
    ngtemplates: 'grunt-angular-templates',
  });
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    buildDir: 'openeis/ui/static/openeis-ui/',
    wheelDir: 'openeis/',
    wheelDestDir: '../openeis/lib/openeis-ui/', // assumes backend working copy is sibling dir called 'openeis'

    clean: {
      build: ['<%= buildDir %>'],
      artifacts: [
        '<%= buildDir %>js/app.js',
        '<%= buildDir %>js/app.templates.js',
      ],
      karma: ['coverage'],
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
            'bower_components/d3/d3.min.js',
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
        src: 'src/index.html',
        dest: '<%= buildDir %>',
        options: {
          scripts: {
            app: '<%= buildDir %>js/app.min.js',
          },
        },
      },
      dev: {
        src: 'src/index.html',
        dest: '<%= buildDir %>',
        options: {
          scripts: {
            app: [
              '<%= buildDir %>js/d3.js',
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
      },
      dev: {
        background: true,
        singleRun: false,
        reporters: ['progress', 'coverage'],
        coverageReporter: {
          reporters: [
            { type: 'html' },
            { type: 'text' },
          ],
        },
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
            'src/**/*.js',
            '!src/**/*_test.js',
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
        src: 'src/**/*.tpl.html',
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
          '<%= buildDir %>css/app.css': 'src/app.scss',
        },
      },
      dev: {
        options: {
          style: 'nested',
        },
        files: {
          '<%= buildDir %>css/app.css': 'src/app.scss',
        },
      }
    },

    sync: {
      static: {
        files: [
          {
            cwd: 'src/',
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
              'bower_components/d3/d3.js',
              'bower_components/angular*/angular*.js',
              '!bower_components/angular*/angular*.min.js',
              'bower_components/ng-file-upload/angular-file-upload.js',
              'bower_components/autofill-event/src/autofill-event.js',
              'bower_components/tv4/tv4.js',
              'src/**/*.js',
              '!src/**/*_test.js',
              '!src/settings.js',
            ],
            dest: '<%= buildDir %>js/',
            flatten: true,
          },
        ],
      },
      package: {
        files: [
          {
            src: '<%= wheelDir %>/**',
            dest: '<%= wheelDestDir %>',
          }
        ],
      }
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

      templates: {
        files: 'src/**/*.tpl.html',
        tasks: ['ngtemplates'],
      },

      sync: {
        files: [
          'src/settings.js',
          'src/sensormap-schema.json',
          'src/**/*.js',
          '!src/**/*_test.js',
        ],
        tasks: ['sync:static', 'sync:dev'],
      },

      sass: {
        files: ['src/**/*.scss'],
        tasks: ['sass:dev'],
      },

      html: {
        files: [
          'src/index.html',
        ],
        tasks: ['htmlbuild:dev', 'livereload_snippet'],
      },

      htmlJs: {
        options: {
          event: ['added', 'deleted'],
        },
        files: [
          'src/**/*.js',
          '!src/**/*_test.js',
        ],
        tasks: ['htmlbuild:dev', 'livereload_snippet'],
      },

      karma: {
        files: 'src/**/*.js',
        tasks: ['clean:karma', 'karma:dev:run'],
      },
    }
  });

  grunt.registerTask('build', [
    'clean:build', 'sass:build', 'sync:static', 'ngmin', 'ngtemplates',
    'uglify', 'concat:build', 'htmlbuild:build', 'clean:artifacts',
  ]);

  grunt.registerTask('build-dev', [
    'clean:build', 'sass:dev', 'sync:static', 'sync:dev', 'ngtemplates', 'htmlbuild:dev',
  ]);

  grunt.registerTask('package', ['build', 'sync:package']);

  grunt.registerTask('default', [
    'karma:dev:start', 'build-dev', 'livereload_snippet', 'watch',
  ]);
};
