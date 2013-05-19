'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
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
            src: 'src/**/*.js',
            options: {
                specs: 'test/*-test.js',
                vendor: 'test/vendor/*.js',
                helpers: 'test/*-helper.js',
                template: require('grunt-template-jasmine-requirejs')
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
        'saucelabs-jasmine': {
            all: {
                username: 'pimterry',
                key: 'KEY',
                urls: ['http://localhost:8000/_SpecRunner.html'],
                browsers: [
                    {"browserName": "iehta", "platform": "Windows 2008", "version": "9"},
                    // {"browserName": "firefox", "platform": "Windows 2003", "version": "3.0"},
                    // {"browserName": "firefox", "platform": "Windows 2003", "version": "3.5"},
                    {"browserName": "firefox", "platform": "Windows 2003", "version": "3.6"},
                    {"browserName": "firefox", "platform": "Windows 2003", "version": "4"},
                    {"browserName": "firefox", "platform": "Windows 2003", "version": "19"},
                    {"browserName": "safari", "platform": "Mac 10.6", "version": "5"},
                    {"browserName": "safari", "platform": "Mac 10.8", "version": "6"},
                    {"browserName": "googlechrome", "platform": "Windows 2003"},
                    {"browserName": "opera", "platform": "Windows 2003", "version": "12"},
                    {"browserName": "iehta", "platform": "Windows 2003", "version": "6"},
                    {"browserName": "iehta", "platform": "Windows 2003", "version": "7"},
                    {"browserName": "iehta", "platform": "Windows 2008", "version": "8"},
                ],
                concurrency: 3,
                detailedError: true,
                testTimeout:10000,
                testInterval:1000,
                testReadyTimeout:2000,
                testname: 'loglevel jasmine test',
                tags: [process.env.TRAVIS_REPO_SLUG || "local", process.env.TRAVIS_COMMIT || "manual"]
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
                src: ['test/*.js']
            },
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'jasmine']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'jasmine']
            },
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-saucelabs');

    // Default task.
    grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify']);

    // Just tests
    grunt.registerTask('test', ['jshint', 'jasmine']);

    // Test with a live server and an actual browser
    grunt.registerTask('integration-test', ['jasmine:src:build', 'connect:test:keepalive', 'open:jasmine']);

    // Test with lots of browsers on saucelabs
    grunt.registerTask('saucelabs', ['jasmine:src:build', 'connect:test', 'saucelabs-jasmine']);

};
