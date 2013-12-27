/*global phil, troop, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
var ns = {}; // global namespace

(function () {
    "use strict";

    module("Postponed");

    test("Postpone", function () {
        var ns = {};

        if (phil.hasGetterSetter()) {
            expect(11);
        } else {
            expect(9);
        }

        troop.postpone(ns, 'bar', function (object, propertyName, param1, param2) {
            ok(object === ns, "Object passed to generator");
            equal(propertyName, 'bar', "Property name passed to generator");
            equal(param1, 'param1', "Extra parameter passed to generator");
            equal(param2, 'param2', "Extra parameter passed to generator");
            return "foo";
        }, "param1", "param2");

        if (phil.hasGetterSetter()) {
            equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Placeholder value");
        }

        // first access will replace the placeholder
        equal(ns.bar, "foo", "Accessing for the first time");
        equal(Object.getOwnPropertyDescriptor(ns, 'bar').value, "foo", "Value of replaced placeholder");

        ns = {};

        troop.postpone(ns, 'bar', function () {
            ns.bar = 'foo';
        });

        if (phil.hasGetterSetter()) {
            // placeholder replacement via setter requires real setters
            equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Placeholder value");
        }

        equal(ns.bar, "foo", "Accessing for the first time");

        raises(function () {
            troop.postpone(ns, 'bar', "bar");
        }, "Invalid generator function passed");
        equal(ns.bar, "foo", "Property value after second attempt to replace placeholder");
    });

    test("Amendment", function () {
        expect(8);

        var ns = {},
            propertyDescriptor;

        troop.postpone(ns, 'foo', function () {
            return {bar: 'bar'};
        });

        propertyDescriptor = Object.getOwnPropertyDescriptor(ns, 'foo');

        ok(!propertyDescriptor.get.amendments, "No amendments yet");

        var modifier = function (ns, propertyName, extraParam) {
            equal(extraParam, 'extraParam');
            ns.foo.bar += 'baz';
        };

        troop.amendPostponed(ns, 'foo', modifier, 'extraParam');

        ok(propertyDescriptor.get.amendments instanceof Array, "Amendment container is array");
        equal(propertyDescriptor.get.amendments.length, 1, "One amendment in container");

        var amendment = propertyDescriptor.get.amendments[0];

        ok(typeof amendment, 'object', "Amendment is object");
        strictEqual(amendment.modifier, modifier, "Modifier function");
        deepEqual(amendment.args, [ns, 'foo', 'extraParam'], "Modifier arguments");

        // amendment resolution
        var value = ns.foo;

        equal(ns.foo.bar, 'barbaz', "Object property after being fully resolved");
    });

    test("Amending resolved property", function () {
        var ns = {
            foo: {bar: 'bar'}
        };

        troop.amendPostponed(ns, 'foo', function () {
            ns.foo.bar += 'baz';
        });

        equal(ns.foo.bar, 'barbaz', "Amendment applied immediately");
    });
}());
