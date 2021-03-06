/**
 * Feature detection unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function () {
    "use strict";

    module("Feature detection");

    test("Flags", function () {
        ok(troop.hasOwnProperty('testing'), "Testing flag exists");
        ok(troop.hasOwnProperty('writable'), "Writable flag exists");
    });
}());
