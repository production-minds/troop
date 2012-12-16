/**
 * Property management unit tests
 */
/*global troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
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
            value: "bar",
            writable: false,
            enumerable: false,
            configurable: false
        });

        deepEqual(
            Object.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                value: "bar",
                writable: true,
                enumerable: true,
                configurable: true
            },
            "Assigned property descriptor (sloppy mode)"
        );

        troop.sloppy = false;

        Properties._defineProperty(tmp, 'foo', {
            value: "bar",
            writable: false,
            enumerable: false,
            configurable: false
        });

        deepEqual(
            Object.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                value: "bar",
                writable: false,
                enumerable: false,
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

    test("Accessor validation", function () {
        var derived = Object.create({});
        derived.get = function () {};

        equal(Properties._isAccessor(null), false, "Null does not validate");
        equal(Properties._isAccessor('a'), false, "Non-object does not validate");
        equal(Properties._isAccessor({}), false, "Empty object does not validate");
        equal(Properties._isAccessor({get: 'a'}), false, "Non-function 'get' does not validate");
        equal(Properties._isAccessor({get: function () {}}), true, "Getter only validates");
        equal(Properties._isAccessor({set: function () {}}), true, "Setter only validates");
        equal(Properties._isAccessor({get: function () {}, set: function () {}}), true, "Full accessor validates");
        equal(Properties._isAccessor({get: function () {}, foo: 'bar'}), false, "Dirty getter fails");
        equal(Properties._isAccessor(derived), false, "Derived object fails (even w/ valid getter-setter)");
    });

    test("Type restriction", function () {
        equal(
            Properties._checkType({a: undefined, b: undefined}, 'string'),
            true,
            "Undefined always meets type restriction"
        );

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

        equal(
            Properties._checkType({a: function () {}, b: {get: function () {}}}, 'function'),
            true,
            "Getter-setter validates as function"
        );

        var myClass = troop.Base.extend()
            .addMethod({
                init: function () {},
                foo: function () {}
            });

        equal(
            Properties._checkType({a: myClass.extend(), b: myClass.extend()}, myClass),
            true,
            "Object properties meet class restriction"
        );

        equal(
            Properties._checkType({a: 'hello', b: myClass.extend()}, myClass),
            false,
            "Object properties fail class restriction"
        );
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

    test("Base", function () {
        var testing = troop.testing,
            extended;

        troop.testing = false;
        extended = troop.Base.extend();
        equal(Properties.getBase.call(extended), troop.Base, "Getting base class in live mode");

        troop.testing = true;
        extended = troop.Base.extend();
        equal(Properties.getBase.call(extended), troop.Base, "Getting base class in testing mode");

        troop.testing = testing;
    });

    test("Trait validation", function () {
        equal(Properties._isTrait({}), true, "Simple object validates as trait");

        var base = {},
            child = Object.create(base),
            trait = Object.create(base),
            grandchild = Object.create(child);

        equal(Properties._isTrait(trait), false, "Derived objects don't validate on their own");
        equal(Properties._isTrait(trait, grandchild), true, "Object with immediate ancestor common with host validates");
        equal(Properties._isTrait(trait, child), true, "Object with same base validates");
    });

    test("Adding traits", function () {
        var hasPropertyAttributes = Feature.hasPropertyAttributes(),
            base = {},
            trait = Object.create(base),
            destination;

        Object.defineProperty(base, 'boo', {
            value: 'far',
            writable: false,
            enumerable: false,
            configurable: false
        });

        Object.defineProperty(trait, 'foo', {
            value: 'bar',
            writable: false,
            enumerable: false,
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
                value: 'bar',
                writable: !hasPropertyAttributes,
                enumerable: !hasPropertyAttributes,
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
                value: 'far',
                writable: !hasPropertyAttributes,
                enumerable: !hasPropertyAttributes,
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

        Properties.addPrivate.call(tmp, {
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

        equal(tmp.hasOwnProperty('bar'), false, "Invalid private property not added");
        equal(tmp.hasOwnProperty('_bar'), false, "Invalid private property not prefixed");
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
