/**
 * Feature detection unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function () {
    module("Feature detection");

    test("Covering RO properties", function () {
        var browser = navigator.userAgent.match(/(\w+)(?=\/[\w\.]+)/g).pop().toLowerCase();
        switch (browser) {
        case 'firefox':
            equal(troop.feature.canAssignToReadOnly(), false, "Can't assign to RO property in Firefox");
            break;
        case 'safari':
            equal(troop.feature.canAssignToReadOnly(), true, "Can assign to RO property in Safari/Chrome");
            break;
        }
    });
}());
