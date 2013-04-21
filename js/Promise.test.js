/**
 * Property management unit tests
 */
/*global troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
var ns = {}; // global namespace

(function () {
    "use strict";

    module("Promise");

    test("Promise", function () {
        var ns = {};

        expect(11);

        troop.promise(ns, 'bar', function (object, propertyName, param1, param2) {
            ok(object === ns, "Object passed to generator");
            equal(propertyName, 'bar', "Property name passed to generator");
            equal(param1, 'param1', "Extra parameter passed to generator");
            equal(param2, 'param2', "Extra parameter passed to generator");
            return "foo";
        }, "param1", "param2");

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Value before fulfilling promise");

        // first access will fulfill the promise
        equal(ns.bar, "foo", "Accessing for the first time");
        equal(Object.getOwnPropertyDescriptor(ns, 'bar').value, "foo", "Property value after promise is fulfilled");

        ns = {};

        troop.promise(ns, 'bar', function () {
            ns.bar = 'foo';
        });

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Value before fulfilling promise");
        equal(ns.bar, "foo", "Accessing for the first time");

        raises(function () {
            troop.promise(ns, 'bar', "bar");
        }, "Invalid generator function passed");
        equal(ns.bar, "foo", "Property value after second attempt to apply promise");
    });
}());
