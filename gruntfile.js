/*global module */
module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        jstestdriver: {
            files  : ["js/jsTestDriver.conf"]
        }
    });

    grunt.loadNpmTasks('grunt-jstestdriver');

    grunt.registerTask('default', ['jstestdriver']);
};
