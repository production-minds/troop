/**
 * Base class unit tests
 */
/*global dessert, troop, module, test, ok, equal, notEqual, strictEqual, deepEqual, raises, expect, mock, unMock */
(function (Base, Feature) {
    module("Base");

    test("Method addition", function () {
        var isES4 = !Feature.hasPropertyAttributes();

        equal(Base.hasOwnProperty('foo'), false, "Method not present previously");

        raises(function () {
            Base.addMethod('foo');
        }, "Non-object throws error");

        raises(function () {
            Base.addMethod({
                foo: 'bar'
            });
        }, "Non-function throws error");

        var func = function () {},
            result = Base.addMethod({
                foo: func
            });

        equal(result, Base, "addMethod returns self");

        if (isES4) {
            equal(Base.hasOwnProperty('foo'), true, "Method added");
        } else {
            deepEqual(Object.getOwnPropertyDescriptor(Base, 'foo'), {
                value       : func,
                enumerable  : true,
                writable    : false,
                configurable: false
            }, "Method added");
        }

        Base.addPrivateMethod({
            _foo: func
        }, true);

        if (isES4) {
            equal(Base.hasOwnProperty('_foo'), true, "Private method added");
        } else {
            deepEqual(Object.getOwnPropertyDescriptor(Base, '_foo'), {
                value       : func,
                enumerable  : false,
                writable    : false,
                configurable: false
            }, "Private method added");
        }
    });

    test("Class extension", function () {
        var myClass = Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) === Object.prototype, "Immediate prototype is base");
    });

    test("Extension while in test mode", function () {
        troop.testing = true;

        var myClass = Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) !== Object.prototype, "Immediate prototype not base");
        ok(Object.getPrototypeOf(Object.getPrototypeOf(myClass)) === Object.prototype, "Second prototype is base");

        troop.testing = false;
    });

    test("Base", function () {
        var testing = troop.testing,
            extended;

        troop.testing = false;
        extended = troop.Base.extend();
        equal(Base.getBase.call(extended), troop.Base, "Getting base class in live mode");

        troop.testing = true;
        extended = troop.Base.extend();
        equal(Base.getBase.call(extended), troop.Base, "Getting base class in testing mode");

        troop.testing = testing;
    });

    test("Custom assertions", function () {
        var v = dessert.validators,
            extended = Base.extend();

        equal(v.isClass(extended), true, "Troop class passes assertion");
        equal(v.isClass({}), false, "Ordinary object fails assertion");
        equal(v.isClassOptional(extended), true, "Troop class passes assertion (optional)");
        equal(v.isClassOptional(), true, "Undefined passes assertion (optional)");
        equal(v.isClassOptional({}), false, "Ordinary object fails assertion (optional)");
    });

    test("Extension", function () {
        var hasPropertyAttributes = Feature.hasPropertyAttributes(),
            derived, keys,
            instance;

        function testMethod() {}

        /**
         * Initializer for derived class
         */
        function init() {
            this
                .addPrivate({
                    _woo: "hoo"
                }).addPublic({
                    holy: "moly"
                }).addConstant({
                    pi: 3.14
                });
        }

        derived = troop.Base.extend()
            .addPrivate({
                _hello: "world"
            }).addPublic({
                yo: "momma"
            }).addMethod({
                foo : testMethod,
                init: init
            });

        keys = Object.keys(derived).sort();
        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['foo', 'init', 'yo'] :
                ['_hello', 'foo', 'init', 'yo'],
            "Public class members"
        );

        equal(derived._hello, "world", "Private class member");

        instance = derived.create();
        keys = Object.keys(instance).sort();

        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['holy', 'pi'] :
                ['_woo', 'holy', 'pi'],
            "Public instance members"
        );

        equal(instance._woo, "hoo", "Private instance member");

        equal(instance.getBase(), derived, "Instance extends from derived");
        equal(derived.getBase(), troop.Base, "Derived extends from troop.Base");
        equal(troop.Base.getBase(), Object.prototype, "Troop.Base extends from Object.prototype");
    });

    test("Base validation", function () {
        ok(Base.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok(Base.isA.call([], Array.prototype), "[] is an Array.prototype");

        var myBase = troop.Base.extend()
                .addMethod({init: function () {}}),
            myChild = myBase.extend()
                .addMethod({init: function () {}});

        ok(Base.instanceOf.call(myChild, myBase), "Direct descendant");
        ok(Base.instanceOf.call(myBase, troop.Base), "Direct descendant");
        ok(!Base.instanceOf.call(myChild, troop.Base), "Not direct descendant");

        ok(Base.isA.call(myChild, troop.Base), "Not direct descendant");

        ok(troop.Base.isBaseOf(myBase), "Troop base class is base to all others");
        ok(myBase.isBaseOf(myChild), "Descendant");
        ok(!myChild.isBaseOf(myBase), "Invalid relation");
        ok(!myChild.isBaseOf(myChild), "Self is not base");
    });
}(troop.Base, troop.Feature));
