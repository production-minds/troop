/**
 * Inheritance unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect, raises */
(function (Inheritance, Feature) {
    module("Instantiation");

    test("Instantiation", function () {
        var instance1, instance2;

        expect(5);

        troop.Base.init = function (arg) {
            this.foo = "bar";
            equal(arg, 'testArgument', "Class init called");
        };
        instance1 = troop.Base.create('testArgument');
        equal(instance1.foo, "bar", "Instance initialized");

        troop.Base.init = function () {
            return instance1;
        };
        instance2 = troop.Base.create();
        equal(instance2, instance1, "Instantiation returned a different object");

        troop.Base.init = function () {
            return 5; // invalid type to return here
        };
        raises(function () {
            instance2 = troop.Base.create();
        }, "Initializer returned invalid type");

        delete troop.Base.init;

        raises(
            function () {
                instance1 = troop.Base.create('testArgument');
            },
            "Class doesn't implement .init method"
        );
    });

    test("Custom instance value", function () {
        expect(3);

        troop.Base.init = function () {
            return troop.Base; // not immediate extension of class
        };
        raises(function () {
            troop.Base.create();
        }, "Initializer returned object same as class");

        var result = Object.create(troop.Base);
        troop.Base.init = function () {
            return result; // not full immediate extension of class
        };
        equal(troop.Base.create(), result, "Initializer returns immediate extension of class");

        result = Object.create(Object.create(troop.Base));
        troop.Base.init = function () {
            return result; // not full immediate extension of class
        };
        equal(troop.Base.create(), result, "Initializer returned farther extension of class");

        delete troop.Base.init;
    });

    test("Custom instance value in testing mode", function () {
        expect(1);
        troop.testing = true;

        troop.Base.init = function () {
            return troop.Base; // not immediate extension of class
        };
        raises(function () {
            troop.Base.create();
        }, "Initializer returned object same as class");

        troop.testing = false;
        delete troop.Base.init;
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
                foo: testMethod,
                init: init
            });

        keys = Object.keys(derived).sort();
        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['foo', 'init', 'yo'] :
                ['_hello', 'constructor', 'foo', 'init', 'yo'],
            "Public class members"
        );

        equal(derived._hello, "world", "Private class member");

        instance = derived.create();
        keys = Object.keys(instance).sort();

        deepEqual(
            keys,
            hasPropertyAttributes ?
                ['holy', 'pi'] :
                ['_woo', 'constructor', 'holy', 'pi'],
            "Public instance members"
        );

        equal(instance._woo, "hoo", "Private instance member");

        equal(instance.getBase(), derived, "Instance extends from derived");
        equal(derived.getBase(), troop.Base, "Derived extends from troop.Base");
        equal(troop.Base.getBase(), Object.prototype, "Troop.Base extends from Object.prototype");
    });

    test("Instantiation", function () {
        var myInstance = Inheritance._instantiate.call(Object.prototype);

        ok(Object.getPrototypeOf(myInstance) === Object.prototype, "Instantiated Object prototype");
    });

    test("Base validation", function () {
        ok(Inheritance.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok(Inheritance.isA.call([], Array.prototype), "[] is an Array.prototype");
    });
}(
    troop.Instantiation,
    troop.Feature
));
