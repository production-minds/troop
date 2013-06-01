/*global module */
module.exports = function (grunt) {
    "use strict";

    // Project configuration.
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

    grunt.loadNpmTasks('grunt-jstestdriver');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('build', ['concat']);
    grunt.registerTask('test', ['jshint', 'jstestdriver']);
    grunt.registerTask('default', ['jstestdriver']);
};
