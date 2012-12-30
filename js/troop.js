/**
 * Top-Level Library Namespace
 */
/*global exports, require */
var troop = {},
    dessert;

// adding Node.js dependencies
if (typeof exports === 'object' && typeof require === 'function') {
    dessert = require('dessert-0.2.1').dessert;
}
