/**
 * Top-Level Library Namespace
 */
/*global exports, require */
var troop,
    dessert;

(function () {
    /** @namespace */
    troop = this.troop = {};
}());

// adding Node.js dependencies
if (typeof exports === 'object' && typeof require === 'function') {
    dessert = require('dessert-0.2.3').dessert;
}
