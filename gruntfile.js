/*global module */
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                dest: 'out/<%= pkg.name %>.js'
            }
        },

        min: {
            dist: {
                src : ['out/<%= pkg.name %>.js'],
                dest: 'out/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },

        copy: {
            main: {
                files: [
                    {src: 'out/<%= pkg.name %>.js', dest: 'out/<%= pkg.name %>-<%= pkg.version %>.js'}
                ]
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
    grunt.registerTask('build', ['test', 'concat', 'min', 'copy']);

    grunt.registerTask('default', ['test']);
};
