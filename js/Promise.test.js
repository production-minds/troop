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
        window.hello = {world: "test"};
        equal(Promise._resolve(['hello', 'world']), "test", "Resolving existing object");
        equal(typeof Promise._resolve(['hi', 'world']), 'undefined', "Resolving non-existing object");
    });

    test("Promise argument processing", function () {
        var testFunc = function () {};

        window.test = {
            path: {}
        };

        deepEqual(
            Promise._normalizeArguments('test.path.prop', testFunc),
            {
                path        : 'test.path.prop',
                host        : window.test.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with full path"
        );

        deepEqual(
            Promise._normalizeArguments('test.path', 'prop', testFunc),
            {
                path        : 'test.path.prop',
                host        : window.test.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with host path & property name"
        );

        deepEqual(
            Promise._normalizeArguments(window.test.path, 'prop', testFunc),
            {
                path        : undefined,
                host        : window.test.path,
                propertyName: 'prop',
                generator   : testFunc
            },
            "Promise args with host object & property name"
        );
    });

    test("Promise", function () {
        var ns = {};

        expect(10);

        Promise.promise(ns, 'test', function (object, propertyName, param1, param2) {
            ok(object === ns, "Object passed to generator");
            equal(propertyName, 'test', "Property name passed to generator");
            equal(param1, 'param1', "Extra parameter passed to generator");
            equal(param2, 'param2', "Extra parameter passed to generator");
            return "foo";
        }, "param1", "param2");

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'test').value, 'undefined', "Value before fulfilling promise");

        // first access will fulfill the promise
        equal(ns.test, "foo", "Accessing for the first time");
        equal(Object.getOwnPropertyDescriptor(ns, 'test').value, "foo", "Property value after promise is fulfilled");

        ns = {};

        Promise.promise(ns, 'test', function () {
            ns.test = 'foo';
        });

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'test').value, 'undefined', "Value before fulfilling promise");
        equal(ns.test, "foo", "Accessing for the first time");

        // supposed to emit a warning
        Promise.promise(ns, 'test', "bar");
        equal(ns.test, "foo", "Property value after second attempt to apply promise");
    });

    test("Promise with tracking", function () {
        window.test = {
            path: {}
        };

        equal(Promise.unfulfilled.hasOwnProperty('test.path.prop'), false, "Promise not in registry yet");

        function generator() {
            return "foo";
        }

        Promise.promise('test.path.prop', generator);
        equal(Promise.unfulfilled['test.path.prop'], true, "Promise in registry");

        equal(window.test.path.prop, "foo", "Promise fulfilled");
        equal(Promise.unfulfilled.hasOwnProperty('test.path.prop'), false, "Promise removed from registry");
    });
}(
    troop.Promise
));
