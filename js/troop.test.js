/**
 * Property management unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function () {
    module("Troop");

    test("Constants", function () {
        ok(troop.hasOwnProperty('testing'), "Testing flag exists");
        ok(troop.hasOwnProperty('writable'), "Writable flag exists");
    });
}());
