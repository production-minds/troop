/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        "files": [
            "js/license.js",
            "js/namespace.js",
            "js/Feature.js",
            "js/Base.js",
            "js/Memoization.js",
            "js/Surrogate.js",
            "js/Instantiation.js",
            "js/Properties.js",
            "js/Promise.js",
            "js/exports.js"
        ],

        "test": [
            "js/jsTestDriver.conf"
        ],

        "globals": {
            "dessert": true
        }
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
