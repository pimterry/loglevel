'use strict';

module.exports = function (grunt) {
    var jasmineRequireJsOptions = {
        specs: 'test/*-test.js',
        helpers: 'test/*-helper.js',
    };

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %>' +
                ' - <%= pkg.homepage %>' +
                ' - (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' +
                ' - licensed <%= pkg.license %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jasmine: {
            requirejs: {
                src: [],
                options: {
                    specs: jasmineRequireJsOptions.specs,
                    helpers: jasmineRequireJsOptions.helpers,
                    template: require('./vendor/grunt-template-jasmine-requirejs')
                }
            },
            global: {
                src: 'lib/**/*.js',
                options: {
                    specs: 'test/global-integration.js',
                }
            },
            context: {
                src: 'test/test-context-using-apply.generated.js',
                options: {
                    specs: 'test/global-integration-with-new-context.js',
                }
            },
            // Wraps the `requirejs` configuration above with Instanbul code
            // coverage tracking.
            withCoverage: {
                src: 'lib/**/*.js',
                options: {
                    specs: jasmineRequireJsOptions.specs,
                    helpers: jasmineRequireJsOptions.helpers,
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'coverage/coverage.json',
                        report: [
                            {
                                type: 'html',
                                options: {
                                    dir: 'coverage'
                                }
                            },
                            {
                                type: 'lcov',
                                options: {
                                    dir: 'coverage'
                                }
                            }
                        ],

                        template: require('./vendor/grunt-template-jasmine-requirejs')
                    }
                }
            }
        },
        "jasmine_node": {
            test: {
                options: {
                    match: "node-integration.",
                    matchall: true,
                    projectRoot: "./test",
                    useHelpers: false
                }
            }
        },
        open: {
            jasmine: {
                path: 'http://127.0.0.1:8000/_SpecRunner.html'
            }
        },
        connect: {
            test: {
                port: 8000,
                keepalive: true
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                options: {
                    jshintrc: 'lib/.jshintrc'
                },
                src: ['lib/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/*.js', '!test/*.generated.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'test']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'test']
            }
        },
        preprocess: {
            "test-context-using-apply": {
                src: 'test/test-context-using-apply.js',
                dest: 'test/test-context-using-apply.generated.js'
            }
        },
        clean:{
            test:['test/test-context-using-apply.generated.js']
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Build a distributable release
    grunt.registerTask('dist', ['test', 'dist-build']);
    grunt.registerTask('dist-build', ['concat', 'uglify']);

    // Check everything is good
    grunt.registerTask('test', ['jshint', 'test-browser', 'test-node']);
    grunt.registerTask('test-browser', ['jasmine:global', 'preprocess', 'jasmine:context', 'clean:test', 'jasmine:withCoverage']);
    grunt.registerTask('test-node', ['jasmine_node']);

    // Test with a live server and an actual browser
    grunt.registerTask('integration-test', ['jasmine:requirejs:src:build', 'open:jasmine', 'connect:test:keepalive']);

    // Default task.
    grunt.registerTask('default', 'test');

    // HACK: grunt-jasmine-node v0.3.x is fundamentally broken with respect to
    // configuration, but contains other fixes required to function in modern
    // Node.js versions. This hack works around the broken-ness:
    //
    // Instead of loading options from `this.options()`, grunt-jasmine-node
    // loads them via `grunt.config()`, which is not meant to for this purpose
    // and doesn't give multitasks (which grunt-jasmine-node is) a way to read
    // the options that they are being run with.
    // To fix it, we patch `grunt.config()` so that it passes back the options
    // for the "test" subtask (our only subtask; this wouldn't work if we had
    // more) when asked for "jasmine_node"-related options.
    //
    // It appears that this was an accidental regression due to a bad manual
    // merge of https://github.com/jasmine-contrib/grunt-jasmine-node/pull/36,
    // which was based on very out-of-date code.
    // (actual commit: https://github.com/jasmine-contrib/grunt-jasmine-node/commit/3c8012e5632fa265dd229e3a04fbcc6eb80a7730).
    //
    // Someone posted a PR to fix it, but it appears the project is dead:
    // https://github.com/jasmine-contrib/grunt-jasmine-node/pull/70
    var _gruntConfig = grunt.config;
    grunt.config = function (property) {
        if (arguments.length === 1 && property.indexOf('jasmine_node.') === 0) {
            var propertyPath = property.split('.');
            propertyPath.splice(1, 0, 'test.options');
            var newProperty = propertyPath.join('.');
            return _gruntConfig.call(this, newProperty);
        }
        return _gruntConfig.apply(this, arguments);
    };
    for (var key in _gruntConfig) {
        if (_gruntConfig.hasOwnProperty(key)) {
            grunt.config[key] = _gruntConfig[key];
        }
    }
};
