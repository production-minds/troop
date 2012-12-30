/**
 * Property management unit tests
 */
/*global dessert, troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
(function (Properties, Feature) {
    module("Properties");

    test("Utils", function () {
        if (!Feature.hasPropertyAttributes()) {
            // no need to check when we're in ES4
            expect(0);
            return;
        }

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
        raises(function () {
            dessert.isAllPrefixed({foo: 'hello', bar: 'world'}, 'f');
        }, "Object properties fail prefix restriction");

        equal(
            dessert.isAllPrefixed({foo: 'hello', far: 'world'}, 'f'),
            dessert,
            "Object properties meet prefix restriction"
        );
    });

    test("Accessor validation", function () {
        var derived = Object.create({});
        derived.get = function () {};

        raises(function () {
            dessert.isAccessor(null);
        }, "Null does not validate");

        equal(dessert.isAccessor(null, true), false, "Null does not validate (soft mode)");

        raises(function () {
            dessert.isAccessor('a');
        }, "Non-object does not validate");
        raises(function () {
            dessert.isAccessor({});
        }, "Empty object does not validate");
        raises(function () {
            dessert.isAccessor({get: 'a'});
        }, "Non-function 'get' does not validate");

        equal(dessert.isAccessor({get: function () {}}), dessert, "Getter only validates");
        equal(dessert.isAccessor({set: function () {}}), dessert, "Setter only validates");
        equal(dessert.isAccessor({get: function () {}, set: function () {}}), dessert, "Full accessor validates");

        raises(function () {
            dessert.isAccessor({get: function () {}, foo: 'bar'});
        }, "Dirty getter fails");
        raises(function () {
            dessert.isAccessor(derived);
        }, "Derived object fails (even w/ valid getter-setter)");
    });

    test("Property addition", function () {
        var tmp;

        expect(5);

        tmp = {};
        Properties.add.call(tmp, {a: 'foo', b: 'bar'});
        equal(tmp.a, 'foo', "Property added through object");

        tmp = {};
        Properties.add.call(tmp, function () {
            equal(this, tmp, "Generator function receives host object as this");
            return {c: 'foo', d: 'bar'};
        });
        equal(tmp.c, 'foo', "Property added through generator function");

        tmp = {};
        Properties.add.call(tmp, {a: {get: function () {return this.b;}}, b: 'foo'});
        equal(tmp.a, 'foo', "Property added with getter");

        tmp = {};
        Properties.add.call(tmp, {a: null});
        equal(tmp.a, null, "Null property added");
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

    test("Trait validation", function () {
        equal(dessert.isTrait({}, true), true, "Simple object validates as trait");

        var base = {},
            child = Object.create(base),
            trait = Object.create(base),
            grandchild = Object.create(child);

        equal(dessert.isTrait(trait, true), false, "Derived objects don't validate on their own");
        equal(dessert.isTrait(trait, grandchild, true), true, "Object with immediate ancestor common with host validates");
        equal(dessert.isTrait(trait, child, true), true, "Object with same base validates");
    });

    test("Adding traits", function () {
        var hasPropertyAttributes = Feature.hasPropertyAttributes(),
            base = {},
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
            "Trait prototype must match host's"
        );

        destination = Object.create(base);
        Properties.addTrait.call(destination, trait);

        deepEqual(
            Object.getOwnPropertyDescriptor(destination, 'foo'),
            {
                value       : 'bar',
                writable    : !hasPropertyAttributes,
                enumerable  : !hasPropertyAttributes,
                configurable: !hasPropertyAttributes
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
                writable    : !hasPropertyAttributes,
                enumerable  : !hasPropertyAttributes,
                configurable: !hasPropertyAttributes
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
        var hasPropertyAttributes = Feature.hasPropertyAttributes(),
            tmp = {},
            descriptor;

        Properties.add.call(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, !hasPropertyAttributes, "Writable");
        equal(descriptor.enumerable, !hasPropertyAttributes, "Enumerable");
        equal(descriptor.configurable, !hasPropertyAttributes, "Configurable");
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

        var hasPropertyAttributes = Feature.hasPropertyAttributes(),
            tmp = {},
            descriptor;

        Properties.add.call(tmp, {
            test: function () {}
        }, false, false, false);

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, !hasPropertyAttributes, "Enumerable");
        equal(descriptor.configurable, !hasPropertyAttributes, "Configurable");

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

        raises(function () {
            Properties.addPrivate.call(tmp, {
                bar: "bar"
            });
        }, "Invalid private property");

        deepEqual(
            tmp,
            {
                test: testMethod,
                foo : "foo"
            },
            "Enumerable properties of class"
        );
    });

    test("Method elevation", function () {
        var base = {test: function () {return this;}},
            instance = Object.create(base);

        equal(instance.test, base.test, "Instance method same as class method");
        Properties.elevateMethod.call(instance, 'test');
        notEqual(instance.test, base.test, "Instance method differs from class method");

        var test = instance.test;
        equal(test(), instance, "Instance method tied to instance");
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
    troop.Properties,
    troop.Feature
));
