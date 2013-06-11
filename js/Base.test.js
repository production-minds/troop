/**
 * Base class unit tests
 */
/*global dessert, troop, module, test, ok, equal, notEqual, strictEqual, deepEqual, raises, expect, mock, unMock */
(function () {
    "use strict";

    module("Base");

    test("Class extension", function () {
        var myClass = troop.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) === Object.prototype, "Immediate prototype is base");
    });

    test("Extension while in test mode", function () {
        troop.testing = true;

        var myClass = troop.Base.extend.call(Object.prototype);

        ok(Object.getPrototypeOf(myClass) !== Object.prototype, "Immediate prototype not base");
        ok(Object.getPrototypeOf(Object.getPrototypeOf(myClass)) === Object.prototype, "Second prototype is base");

        troop.testing = false;
    });

    test("Base", function () {
        var testing = troop.testing,
            extended;

        troop.testing = false;
        extended = troop.Base.extend();
        equal(troop.Base.getBase.call(extended), troop.Base, "Getting base class in live mode");

        troop.testing = true;
        extended = troop.Base.extend();
        equal(troop.Base.getBase.call(extended), troop.Base, "Getting base class in testing mode");

        troop.testing = testing;
    });

    test("Custom assertions", function () {
        var v = dessert.validators,
            extended = troop.Base.extend();

        equal(v.isClass(extended), true, "Troop class passes assertion");
        equal(v.isClass({}), false, "Ordinary object fails assertion");
        equal(v.isClassOptional(extended), true, "Troop class passes assertion (optional)");
        equal(v.isClassOptional(), true, "Undefined passes assertion (optional)");
        equal(v.isClassOptional({}), false, "Ordinary object fails assertion (optional)");
    });

    test("Extension", function () {
        var hasPropertyAttributes = troop.Feature.hasPropertyAttributes(),
            derived, keys,
            instance;

        function testMethod() {}

        /**
         * Initializer for derived class
         */
        function init() {
            /*jshint validthis:true */
            this
                .addPrivate({
                    _woo: "hoo"
                })
                .addPublic({
                    holy: "moly"
                })
                .addConstants({
                    pi: 3.14
                });
        }

        derived = troop.Base.extend()
            .addPrivate({
                _hello: "world"
            })
            .addPublic({
                yo: "momma"
            })
            .addMethods({
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
        ok(troop.Base.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok(troop.Base.isA.call([], Array.prototype), "[] is an Array.prototype");

        var myBase = troop.Base.extend()
                .addMethods({init: function () {}}),
            myChild = myBase.extend()
                .addMethods({init: function () {}});

        ok(troop.Base.instanceOf.call(myChild, myBase), "Direct descendant");
        ok(troop.Base.instanceOf.call(myBase, troop.Base), "Direct descendant");
        ok(!troop.Base.instanceOf.call(myChild, troop.Base), "Not direct descendant");

        ok(troop.Base.isA.call(myChild, troop.Base), "Not direct descendant");

        ok(troop.Base.isBaseOf(myBase), "Troop base class is base to all others");
        ok(myBase.isBaseOf(myChild), "Descendant");
        ok(!myChild.isBaseOf(myBase), "Invalid relation");
        ok(!myChild.isBaseOf(myChild), "Self is not base");
    });
}());
