/**
 * Top-Level Library Namespace
 */
/*global exports, require */
(function () {
    /** @namespace */
    this.troop = {};
}());

// adding Node.js dependencies
if (typeof require === 'function') {
    require('dessert-0.2.3');
}
