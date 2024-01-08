/*global module:false, define:false*/
module.exports = function(grunt) {
  "use strict";

  var defaultTemplateOptions = {
    requireConfigFile: 'test/fixtures/requirejs/src/main.js',
    requireConfig : {
      baseUrl: './test/fixtures/requirejs/src/',
      config: {
        math: {
          description: "Math module (overridden)"
        },
        sum: {
          description: "Sum module (overridden)"
        },
        serializer: {
          regexp: /foo/,
          fn: function () { return ''; }
        }
      },
      "shim": {
        "fakeShim": {
          "exports": 'fakeShim',
          "init": function () {
            return "this is fake shim";
          }
        }
      },
      "callback": function() {
        define('inlineModule', function() {
          return 'this is inline module';
        });
      }
    }
  };

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        node : true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['src/**/*.js', '!src/lib/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test']
      }
    },
    connect: {
      test: {
        port: 8000,
        base: '.'
      }
    },
    jasmine: {
      requirejs: {
        src: 'test/fixtures/requirejs/src/**/*.js',
        options: {
          specs: 'test/fixtures/requirejs/spec/*Spec.js',
          helpers: 'test/fixtures/requirejs/spec/*Helper.js',
          host: 'http://127.0.0.1:<%= connect.test.port %>/',
          template: require('./'),
          templateOptions: defaultTemplateOptions
        }
      },

      version_path_test: {
        src: 'test/fixtures/requirejs/src/**/*.js',
        options: {
          specs: 'test/fixtures/requirejs/spec/*Spec.js',
          helpers: 'test/fixtures/requirejs/spec/*Helper.js',
          host: 'http://127.0.0.1:<%= connect.test.port %>/',
          template: require('./'),
          templateOptions: grunt.util._.extend({version: "vendor/require-2.1.8.js"}, defaultTemplateOptions)
        }
      },
      parse_test: {
        src: ['test/fixtures/requirejs/src/**/*.js', '!test/fixtures/requirejs/src/main.js'],
        options: {
          specs: 'test/fixtures/requirejs/spec/*Spec.js',
          helpers: 'test/fixtures/requirejs/spec/*Helper.js',
          host: 'http://127.0.0.1:<%= connect.test.port %>/',
          template: require('./'),
          //templateOptions: defaultTemplateOptions.requireConfig
          templateOptions: grunt.util._.extend({
            requireConfigFile: 'test/fixtures/requirejs/src/build.js',
          }, defaultTemplateOptions)
        }
      },
      'require-baseurl': {
        src: 'test/fixtures/require-baseurl/src/**/*.js',
        options: {
          specs: 'test/fixtures/require-baseurl/spec/**/*Spec.js',
          template: require('./'),
          templateOptions: {
            requireConfig: {
              baseUrl: 'test/fixtures/require-baseurl/src/'
            }
          }
        }
      },
      'require-nobaseurl': {
        src: 'test/fixtures/require-nobaseurl/src/**/*.js',
        options: {
          specs: 'test/fixtures/require-nobaseurl/spec/**/*Spec.js',
          template: require('./')
        }
      },
      'require-outfile': {
        src: 'test/fixtures/require-baseurl/src/**/*.js',
        options: {
          outfile: "custom/path/to/_SpecRunner.html",
          specs: 'test/fixtures/require-baseurl/spec/**/*Spec.js',
          template: require('./'),
          templateOptions: {
            requireConfig: {
              baseUrl: '../../../test/fixtures/require-baseurl/src/'
            }
          }
        }
      },
      'require-outfile-same-dir': {
        src: 'test/fixtures/require-baseurl/src/**/*.js',
        options: {
          outfile: ".grunt/grunt-contrib-jasmine/_SpecRunner.html",
          specs: 'test/fixtures/require-baseurl/spec/**/*Spec.js',
          template: require('./'),
          templateOptions: {
            requireConfig: {
              baseUrl: '../../test/fixtures/require-baseurl/src/'
            }
          }
        }
      },
    },
    bump: {
      options: {
        pushTo: 'origin'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-npm');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('test', function(subTask) {
    var taskList = [
        'connect',
        ['jasmine', subTask].join(':')
    ];
    grunt.task.run(taskList);
  });

  // Default task.
  grunt.registerTask('default', [
      'jshint',
      'test',
  ]);
};
