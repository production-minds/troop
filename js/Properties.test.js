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
    });

    test("Prefix restriction", function () {
        equal(
            Properties._checkPrefix({foo: 'hello', bar: 'world'}, 'f'),
            false,
            "Object properties fail prefix restriction"
        );

        equal(
            Properties._checkPrefix({foo: 'hello', far: 'world'}, 'f'),
            true,
            "Object properties meet prefix restriction"
        );
    });

    test("Type restriction", function () {
        equal(
            Properties._checkType({a: 'a', b: 'b'}, 'string'),
            true,
            "Object properties meet type restriction"
        );

        equal(
            Properties._checkType({a: 'a', b: 1}, 'string'),
            false,
            "Object properties fail type restriction"
        );

        var myClass = troop.Base.extend({
            init: function () {},
            foo : function () {}
        });

        equal(
            Properties._checkType({a: myClass.create(), b: myClass.create()}, myClass),
            true,
            "Object properties meet class restriction"
        );

        equal(
            Properties._checkType({a: 'hello', b: myClass.create()}, myClass),
            false,
            "Object properties fail class restriction"
        );
    });

    test("Property addition", function () {
        var tmp;

        expect(3);

        tmp = {};
        Properties.add.call(tmp, {a: 'foo', b: 'bar'});
        equal(tmp.a, 'foo', "Property added through object");

        tmp = {};
        Properties.add.call(tmp, function () {
            equal(this, tmp, "Generator function receives host object as this");
            return {c: 'foo', d: 'bar'};
        });
        equal(tmp.c, 'foo', "Property added through generator function");
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

        equal(tmp.hasOwnProperty('bar'), false, "Invalid private property not added");
        equal(tmp.hasOwnProperty('_bar'), false, "Invalid private property not prefixed");
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
