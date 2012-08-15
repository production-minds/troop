/**
 * Property management unit tests
 */
/*global troop, module, test, expect, ok, equal, deepEqual, raises */
(function (Properties) {
    module("Properties");

    test("Promise", function () {
        var ns = {};

        expect(10);

        Properties.promise(ns, 'test', function (object, propertyName, param1, param2) {
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

        Properties.promise(ns, 'test', function () {
            ns.test = 'foo';
        });

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'test').value, 'undefined', "Value before fulfilling promise");
        equal(ns.test, "foo", "Accessing for the first time");

        // supposed to emit a warning
        Properties.promise(ns, 'test', "bar");
        equal(ns.test, "foo", "Property value after second attempt to apply promise");
    });

    test("Utils", function () {
        var tmp = {};

        troop.sloppy = true;

        Properties._defineProperty(tmp, 'foo', {
            value       : "bar",
            writable    : false,
            enumerable  : false,
            configurable: false
        });

        deepEqual(
            Object.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                value       : "bar",
                writable    : true,
                enumerable  : true,
                configurable: true
            },
            "Assigned property descriptor (sloppy mode)"
        );

        troop.sloppy = false;

        Properties._defineProperty(tmp, 'foo', {
            value       : "bar",
            writable    : false,
            enumerable  : false,
            configurable: false
        });

        deepEqual(
            Object.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                value       : "bar",
                writable    : false,
                enumerable  : false,
                configurable: false
            },
            "Defined property descriptor (normal mode)"
        );

        equal(Properties._addPrefix('test', '_'), '_test', "Prefixed string w/o prefix");
        equal(Properties._addPrefix('_test', '_'), '_test', "Prefixed string w/ prefix");
    });

    test("Type restriction", function () {
        // doesn't raise error
        var tmp = {};
        Properties.add.call(tmp, {
                test: function () {}
            },
            true,
            true,
            true,
            undefined,
            'function'
        );
        equal(tmp.hasOwnProperty('test'), true, "Property of type function added without raising exception");

        raises(function () {
            Properties.add.call(tmp, {
                    test: function () {}
                },
                true,
                true,
                true,
                undefined,
                'string'
            );
        }, "Property type function violates type requirement (string)");
    });

    test("Flags set", function () {
        var tmp = {},
            descriptor;

        Properties.add.call(tmp, {
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

        Properties.add.call(tmp, {
                test: function () {}
            },
            true,
            true,
            true,
            '_'
        );

        equal(tmp.hasOwnProperty('test'), false, "Property by given name doesn't exist");
        equal(tmp.hasOwnProperty('_test'), true, "Prefixed property name exists");

        descriptor = Object.getOwnPropertyDescriptor(tmp, '_test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");

        Properties.add.call(tmp, {
                _hello: function () {}
            },
            true,
            true,
            true,
            '_'
        );

        equal(tmp.hasOwnProperty('_hello'), true, "Prefixed property name exists");
    });

    test("Adding traits", function () {
        var base = {},
            trait = Object.create(base),
            destination;

        Object.defineProperty(base, 'boo', {
            value       : 'far',
            writable    : false,
            enumerable  : false,
            configurable: false
        });

        Object.defineProperty(trait, 'foo', {
            value       : 'bar',
            writable    : false,
            enumerable  : false,
            configurable: false
        });

        raises(
            function () {
                destination = Object.create({});
                Properties.addTrait.call(destination, trait);
            },
            function (err) {
                return err instanceof TypeError;
            },
            "Trait prototype must match host's"
        );

        destination = Object.create(base);
        Properties.addTrait.call(destination, trait);

        deepEqual(
            Object.getOwnPropertyDescriptor(destination, 'foo'),
            {
                value       : 'bar',
                writable    : false,
                enumerable  : false,
                configurable: false
            },
            "Property added as trait"
        );

        troop.testing = true;

        destination = Object.create(base);
        Properties.addTrait.call(destination, trait);

        deepEqual(
            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(destination), 'boo'),
            {
                value       : 'far',
                writable    : false,
                enumerable  : false,
                configurable: false
            },
            "Trait in testing mode"
        );

        troop.testing = false;
    });

    test("Adding methods", function () {
        var tmp = {},
            result;

        result = Properties.addMethod.call(tmp, {
            foo: function () {}
        });

        equal(result, tmp, "addMethod returns input object");
    });

    test("Flags not set", function () {
        var tmp = {},
            descriptor;

        Properties.add.call(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, false, "Writable");
        equal(descriptor.enumerable, false, "Enumerable");
        equal(descriptor.configurable, false, "Configurable");
    });

    test("Sloppy", function () {
        troop.sloppy = true;

        var tmp = {},
            descriptor;

        Properties.add.call(tmp, {
            test: function () {}
        }, false, false, false);

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");

        troop.sloppy = false;
    });

    test("Messy", function () {
        troop.messy = true;

        var tmp = {},
            descriptor;

        Properties.add.call(tmp, {
            test: function () {}
        }, false, false, false);

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, false, "Enumerable");
        equal(descriptor.configurable, false, "Configurable");

        troop.messy = false;
    });

    test("Class assembly", function () {
        var tmp = {};

        function testMethod() {}

        Properties.addMethod.call(tmp, {
            test: testMethod
        });

        Properties.addConstant.call(tmp, {
            foo: "foo"
        });

        Properties.addPrivate.call(tmp, {
            bar: "bar"
        });

        deepEqual(
            tmp,
            {
                test: testMethod,
                foo : "foo"
            },
            "Enumerable properties of class"
        );

        equal(tmp._bar, "bar", "Pseudo-private property added");
    });

    test("Mocks", function () {
        var tmp = {};

        function testMethod() {}

        Properties.addMock.call(tmp, {
            foo: testMethod
        });

        deepEqual(tmp, {
            foo: testMethod
        }, "Mock method added");

        Properties.removeMocks.call(tmp);

        deepEqual(tmp, {}, "Mock methods removed");
    });
}(
    troop.Properties
));
