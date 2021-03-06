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

    test("Owner detection", function () {
        var ClassA = troop.Base.extend()
                .addPublic({
                    foo: 'bar'
                })
                .addMethods({
                    init: function () {}
                }),
            ClassB = ClassA.extend()
                .addMethods({
                    hello: function () {return "world";}
                }),
            ClassC = ClassB.extend(),
            instance = ClassC.create();

        equal(typeof troop.Properties.getOwnerOf(instance, 'invalid'), 'undefined');
        strictEqual(troop.Properties.getOwnerOf(instance, 'foo'), ClassA);
        strictEqual(troop.Properties.getOwnerOf(instance, 'init'), ClassA);
        strictEqual(troop.Properties.getOwnerOf(instance, 'hello'), ClassB);
        strictEqual(troop.Properties.getOwnerOf(ClassA, 'foo'), ClassA);
    });

    test("Property descriptor", function () {
        var ClassA = troop.Base.extend()
                .addPublic({
                    foo: 'bar'
                })
                .addMethods({
                    init: function () {}
                }),
            ClassB = ClassA.extend()
                .addMethods({
                    hello: function () {return "world";}
                }),
            ClassC = ClassB.extend(),
            instance = ClassC.create();

        equal(typeof troop.Properties.getPropertyDescriptor(instance, 'invalid'), 'undefined');
        deepEqual(
            troop.Properties.getPropertyDescriptor(instance, 'foo'),
            Object.getOwnPropertyDescriptor(ClassA, 'foo')
        );
        deepEqual(
            troop.Properties.getPropertyDescriptor(instance, 'init'),
            Object.getOwnPropertyDescriptor(ClassA, 'init')
        );
        deepEqual(
            troop.Properties.getPropertyDescriptor(instance, 'hello'),
            Object.getOwnPropertyDescriptor(ClassB, 'hello')
        );
    });

    test("Property names", function () {
        var ClassA = troop.Base.extend()
                .addPublic({
                    foo: 'bar'
                })
                .addMethods({
                    init: function () {}
                }),
            ClassB = ClassA.extend()
                .addPrivateMethods({
                    _hello: function () {return "world";}
                }),
            ClassC = ClassB.extend(),
            instance = ClassC.create();

        deepEqual(
            troop.Properties.getPropertyNames(instance).sort(),
            ["_hello","addConstants","addMethods","addMocks","addPrivate","addPrivateConstants","addPrivateMethods","addPublic","addSurrogate","addTrait","addTraitAndExtend","clearInstanceRegistry","create","elevateMethod","extend","foo","getBase","getTarget","init","instanceOf","isA","isBaseOf","isMemoized","prepareSurrogates","removeMocks","setInstanceMapper"]
        );
        deepEqual(
            troop.Properties.getPropertyNames(instance, troop.Base).sort(),
            ["_hello","foo","init"]
        );
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

        Object.defineProperty(trait, 'init', {
            value       : function () {},
            writable    : false,
            enumerable  : false,
            configurable: false
        });

        destination = Object.create(base);
        troop.Base.addTrait.call(destination, trait);

        ok(!destination.hasOwnProperty('init'), "Init was not copied over");
        ok(destination.hasOwnProperty('foo'), "Regular property gets copied over");
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

        raises(function () {
            troop.Base.addTrait.call(destination, trait);
        }, "Re-adding trait causes collision");

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

    test("Trait integration", function () {
        expect(4);

        var TraitBase = troop.Base.extend()
                .addPrivateMethods({
                    _hello: function () {
                        ok(true, "Private method called");
                    }
                })
                .addMethods({
                    foo: function () {
                        ok(true, "Base method called");
                    }
                }),
            TraitChild = TraitBase.extend()
                .addMethods({
                    foo: function () {
                        TraitBase.foo.call(this);
                    }
                }),
            MyClass = troop.Base.extend()
                .addTrait(TraitChild)
                .addMethods({
                    init: function () {}
                }),
            myInstance = MyClass.create();

        strictEqual(myInstance._hello, TraitBase._hello);
        strictEqual(myInstance.foo, TraitChild.foo);

        myInstance._hello();
        myInstance.foo();
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
