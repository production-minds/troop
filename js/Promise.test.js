/**
 * Property management unit tests
 */
/*global phil, troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
var ns = {}; // global namespace

(function () {
    "use strict";

    module("Promise");

    test("Promise", function () {
        var ns = {};

        if (phil.hasGetterSetter()) {
            expect(11);
        } else {
            expect(9);
        }

        troop.promise(ns, 'bar', function (object, propertyName, param1, param2) {
            ok(object === ns, "Object passed to generator");
            equal(propertyName, 'bar', "Property name passed to generator");
            equal(param1, 'param1', "Extra parameter passed to generator");
            equal(param2, 'param2', "Extra parameter passed to generator");
            return "foo";
        }, "param1", "param2");

        if (phil.hasGetterSetter()) {
            equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Value before fulfilling promise");
        }

        // first access will fulfill the promise
        equal(ns.bar, "foo", "Accessing for the first time");
        equal(Object.getOwnPropertyDescriptor(ns, 'bar').value, "foo", "Property value after promise is fulfilled");

        ns = {};

        troop.promise(ns, 'bar', function () {
            ns.bar = 'foo';
        });

        if (phil.hasGetterSetter()) {
            // promise fulfillment via setter requires real setters
            equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Value before fulfilling promise");
        }

        equal(ns.bar, "foo", "Accessing for the first time");

        raises(function () {
            troop.promise(ns, 'bar', "bar");
        }, "Invalid generator function passed");
        equal(ns.bar, "foo", "Property value after second attempt to apply promise");
    });
}());
