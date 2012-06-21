/**
 * Property management unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function () {
    module("Properties");

    test("Flags set", function () {
        var tmp = {},
            descriptor;

        troop.properties.add(tmp, {
                test: function () {}
            },
            true,
            true,
            true
        );

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");
    });

    test("Prefixed", function () {
        var tmp = {},
            descriptor;

        troop.properties.add(tmp, {
                test: function () {}
            },
            true,
            true,
            true,
            'p_'
        );

        equal(tmp.hasOwnProperty('test'), false, "Property by given name doesn't exist");
        equal(tmp.hasOwnProperty('p_test'), true, "Prefixed property name exists");

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'p_test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");

        troop.properties.add(tmp, {
                p_hello: function () {}
            },
            true,
            true,
            true,
            'p_'
        );

        equal(tmp.hasOwnProperty('p_hello'), true, "Prefixed property name exists");
    });

    test("Flags not set", function () {
        var tmp = {},
            descriptor;

        troop.properties.add(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, false, "Writable");
        equal(descriptor.enumerable, false, "Enumerable");
        equal(descriptor.configurable, false, "Configurable");
    });

    test("Class assembly", function () {
        var tmp = {};

        function testMethod() {}

        troop.addMethod(tmp, {
            test: testMethod
        });

        troop.addStatic(tmp, {
            foo: "foo"
        });

        troop.addPrivate(tmp, {
            bar: "bar"
        });

        deepEqual(
            tmp,
            {
                test: testMethod,
                foo: "foo"
            },
            "Enumerable properties of class"
        );

        equal(tmp.p_bar, "bar", "Pseudo-private property added");
    });
}());
