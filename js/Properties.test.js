/*global phil, dessert, troop, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Properties");

    test("Prefix restriction assertion", function () {
        var v = dessert.validators;

        equal(
            v.isAllPrefixed({foo: 'hello', bar: 'world'}, 'f'),
            false,
            "Object properties fail prefix restriction"
        );

        equal(
            v.isAllPrefixed({foo: 'hello', far: 'world'}, 'f'),
            true,
            "Object properties meet prefix restriction"
        );
    });

    test("Accessor validation", function () {
        var v = dessert.validators,
            derived = Object.create({});

        derived.get = function () {};

        equal(v.isAccessor(null), false, "Null does not validate");
        equal(v.isAccessor(null), false, "Null does not validate (soft mode)");
        equal(v.isAccessor('a'), false, "Non-object does not validate");
        equal(v.isAccessor({}), false, "Empty object does not validate");
        equal(v.isAccessor({get: 'a'}), false, "Non-function 'get' does not validate");
        equal(v.isAccessor({get: function () {}}), true, "Getter only validates");
        equal(v.isAccessor({set: function () {}}), true, "Setter only validates");
        equal(v.isAccessor({get: function () {}, set: function () {}}), true, "Full accessor validates");
        equal(v.isAccessor({get: function () {}, foo: 'bar'}), false, "Dirty getter fails");
        equal(v.isAccessor(derived), false, "Derived object fails (even w/ valid getter-setter)");
    });

    test("Property addition", function () {
        var tmp;

        tmp = {};
        troop.Properties.addProperties.call(tmp, {a: 'foo', b: 'bar'}, true, true, true);
        equal(tmp.a, 'foo', "Property added through object");

        raises(function () {
            troop.Properties.addProperties.call(tmp, {a: 'blah'});
        }, "Property name conflict");

        if (phil.hasGetterSetter()) {
            // environments where getters and setters are not available
            // can only work with static getter property descriptors
            tmp = {};
            troop.Properties.addProperties.call(tmp, {a: {get: function () {return this.b;}}, b: 'foo'});
            equal(tmp.a, 'foo', "Property added with getter");
        }

        tmp = {};
        troop.Properties.addProperties.call(tmp, {a: null});
        equal(tmp.a, null, "Null property added");
    });

    test("Flags set", function () {
        var tmp = {},
            descriptor;

        troop.Properties.addProperties.call(tmp, {
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
        var v = dessert.validators,
            base = {},
            child = Object.create(base),
            trait = Object.create(base),
            grandchild = Object.create(child);

        equal(v.isTrait({}), true, "Simple object validates as trait");
        equal(v.isTrait(trait), false, "Derived objects don't validate on their own");
        equal(v.isTrait(trait, grandchild), true, "Object with immediate ancestor common with host validates");
        equal(v.isTrait(trait, child), true, "Object with same base validates");
    });

    test("Adding traits", function () {
        var hasPropertyAttributes = troop.Feature.hasPropertyAttributes(),
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
                troop.Base.addTrait.call(destination, trait);
            },
            "Trait prototype must match host's"
        );

        destination = Object.create(base);
        troop.Base.addTrait.call(destination, trait);

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
        troop.Base.addTrait.call(destination, trait);

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

    test("Trait & extend", function () {
        expect(2);

        troop.testing = true;

        var BaseClass = troop.Base.extend(),
            HostClass = BaseClass.extend(),
            MyTrait = troop.Base.extend();

        BaseClass.addMocks({
            addTrait: function (trait) {
                strictEqual(trait, MyTrait, "Trait to be added");
                return this;
            },

            extend: function () {
                ok(true, "Extend called");
            }
        });

        HostClass.addTraitAndExtend(MyTrait);

        BaseClass.removeMocks();

        troop.testing = false;
    });

    test("Adding methods", function () {
        var tmp = {},
            result;

        result = troop.Base.addMethods.call(tmp, {
            foo: function () { return 'foo'; }
        });

        equal(result, tmp, "addMethods returns input object");
        equal(typeof result.foo, 'function', "Method added");
        equal(result.foo(), 'foo', "Method invoked");
    });

    test("Overriding built-in methods", function () {
        var tmp = {},
            delta = {
                toString: function () {
                    return 'foo';
                }
            };

        ok(delta.hasOwnProperty('toString'), "Override on object literal");
        equal(delta.toString(), 'foo', "Serialization invoked");
        equal(tmp.toString(), '[object Object]', "Built-in serializer");

        troop.Base.addMethods.call(tmp, delta);

        equal(typeof tmp.toString, 'function', "Override added");
        equal(tmp.toString(), 'foo', "Serialization invoked");
    });

    test("Flags not set", function () {
        var hasPropertyAttributes = troop.Feature.hasPropertyAttributes(),
            tmp = {},
            descriptor;

        troop.Properties.addProperties.call(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, !hasPropertyAttributes, "Writable");
        equal(descriptor.enumerable, !hasPropertyAttributes, "Enumerable");
        equal(descriptor.configurable, !hasPropertyAttributes, "Configurable");
    });

    test("Messy", function () {
        troop.messy = true;

        var hasPropertyAttributes = troop.Feature.hasPropertyAttributes(),
            tmp = {},
            descriptor;

        troop.Properties.addProperties.call(tmp, {
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

        troop.Base.addMethods.call(tmp, {
            test: testMethod
        });

        troop.Base.addConstants.call(tmp, {
            foo: "foo"
        });

        raises(function () {
            troop.Base.addPrivate.call(tmp, {
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
        var base = troop.Base.extend()
                .addMethods({test: function () {return this;}}),
            instance = Object.create(base);

        equal(instance.test, base.test, "Instance method same as class method");
        troop.Base.elevateMethod.call(instance, 'test');
        notEqual(instance.test, base.test, "Instance method differs from class method");

        var test = instance.test;
        equal(test(), instance, "Instance method tied to instance");
    });

    test("Mocks", function () {
        var tmp = {};

        function testMethod() {}

        raises(function () {
            troop.Base.addMocks.call(tmp, {
                foo: testMethod
            });
        }, "Testing is not on");

        troop.testing = true;

        troop.Base.addMocks.call(tmp, {
            foo: testMethod
        });

        troop.testing = false;

        deepEqual(tmp, {
            foo: testMethod
        }, "Mock method added");

        troop.Base.removeMocks.call(tmp);

        deepEqual(tmp, {}, "Mock methods removed");
    });
}());
