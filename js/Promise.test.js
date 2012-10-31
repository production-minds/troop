/**
 * Property management unit tests
 */
/*global troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
(function (Promise) {
    module("Promise");

    test("Scope", function () {
        equal(Promise.global, window, "Global scope in the browser");
    });

    test("Scope resolution", function () {
        window.hello = {world: "bar"};
        equal(Promise._resolve(['hello', 'world']), "bar", "Resolving existing object");
        equal(typeof Promise._resolve(['hi', 'world']), 'undefined', "Resolving non-existing object");
    });

    test("Promise argument processing", function () {
        var testFunc = function () {};

        window.bar = {
            path: {}
        };

        deepEqual(
            Promise._normalizeArguments('bar.path.prop', testFunc),
            {
                path        : 'bar.path.prop',
                host        : window.bar.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with full path"
        );

        deepEqual(
            Promise._normalizeArguments('bar.path', 'prop', testFunc),
            {
                path        : 'bar.path.prop',
                host        : window.bar.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with host path & property name"
        );

        deepEqual(
            Promise._normalizeArguments(window.bar.path, 'prop', testFunc),
            {
                path        : undefined,
                host        : window.bar.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with host object & property name"
        );
    });

    test("Promise", function () {
        var ns = {};

        expect(10);

        Promise.promise(ns, 'bar', function (object, propertyName, param1, param2) {
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

        Promise.promise(ns, 'bar', function () {
            ns.bar = 'foo';
        });

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'bar').value, 'undefined', "Value before fulfilling promise");
        equal(ns.bar, "foo", "Accessing for the first time");

        // supposed to emit a warning
        Promise.promise(ns, 'bar', "bar");
        equal(ns.bar, "foo", "Property value after second attempt to apply promise");
    });

    test("Promise with tracking", function () {
        window.bar = {
            path: {}
        };

        equal(Promise.unfulfilled.hasOwnProperty('bar.path.prop'), false, "Promise not in registry yet");

        function generator() {
            return "foo";
        }

        Promise.promise('bar.path.prop', generator);
        equal(Promise.unfulfilled['bar.path.prop'], true, "Promise in registry");

        equal(window.bar.path.prop, "foo", "Promise fulfilled");
        equal(Promise.unfulfilled.hasOwnProperty('bar.path.prop'), false, "Promise removed from registry");
    });
}(
    troop.Promise
));
