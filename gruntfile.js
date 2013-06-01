/*global module */
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        outPath           : 'out',
        fileNameVersion   : '<%= pkg.name %>-<%= pkg.version %>.js',
        filePath          : '<%= outPath %>/<%= pkg.name %>.js',
        filePathVersion   : '<%= outPath %>/<%= pkg.name %>-<%= pkg.version %>.js',
        filePathVersionMin: '<%= outPath %>/<%= pkg.name %>-<%= pkg.version %>.min.js',

        concat: {
            options: {
                separator: ''
            },

            dist: {
                src : [
                    'js/license.js',
                    'js/namespace.js',
                    'js/Feature.js',
                    'js/Base.js',
                    'js/Memoization.js',
                    'js/Surrogate.js',
                    'js/Instantiation.js',
                    'js/Properties.js',
                    'js/Promise.js',
                    'js/exports.js'
                ],
                dest: '<%= filePath %>'
            }
        },

        min: {
            dist: {
                src : ['<%= filePath %>'],
                dest: '<%= filePathVersionMin %>'
            }
        },

        copy: {
            main: {
                files: [
                    {src: '<%= filePath %>', dest: '<%= filePathVersion %>'}
                ]
            },

            push: {
                files: grunt.file.readJSON('targets.json')
            }
        },

        jshint: {
            options: {
                globals: {
                    dessert: true
                },

                ignores: ['js/*.test.js']
            },

            all: ['gruntfile.js', 'js/*.js']
        },

        jstestdriver: {
            files: ["js/jsTestDriver.conf"]
        }
    });

    // test-related tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jstestdriver');
    grunt.registerTask('test', ['jshint', 'jstestdriver']);

    // build-related tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-yui-compressor');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('build', ['test', 'concat', 'min', 'copy:main']);

    grunt.registerTask('default', ['test']);
};
