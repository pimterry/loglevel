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
        coveralls: {
            src: 'coverage/lcov.info'
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
    grunt.loadNpmTasks('grunt-coveralls');
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
    grunt.registerTask('ci', ['test', 'coveralls']);

};
