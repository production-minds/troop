/**
 * Feature detection unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function (Feature) {
    module("Feature detection");

    var browser = navigator.userAgent.match(/(\w+)(?=\/[\w\.]+)/g).pop().toLowerCase();

    test("Covering RO properties", function () {
        switch (browser) {
        case 'firefox':
            equal(Feature.canAssignToReadOnly(), false, "Can't assign to RO property in Firefox");
            break;
        case 'safari':
            equal(Feature.canAssignToReadOnly(), true, "Can assign to RO property in Safari/Chrome");
            break;
        }
    });

    test("Flags", function () {
        ok(troop.hasOwnProperty('testing'), "Testing flag exists");
        ok(troop.hasOwnProperty('writable'), "Writable flag exists");
    });
}(troop.Feature));
