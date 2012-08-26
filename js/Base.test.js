/**
 * Base class unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, raises, expect, mock, unMock */
(function () {
    module("Base");

    test("Instantiation", function () {
        var instance1, instance2;

        expect(6);

        troop.Base.init = function (arg) {
            this.foo = "bar";
            equal(arg, 'testArgument', "Class init called");
        };
        instance1 = troop.Base.create('testArgument');
        equal(instance1.foo, "bar", "Instance initialized");

        troop.Base.init = function (arg) {
            return instance1;
        };
        instance2 = troop.Base.create();
        equal(instance2, instance1, "Instantiation returned a different object");

        troop.Base.init = function (arg) {
            return 5; // invalid type to return here
        };
        raises(function () {
            instance2 = troop.Base.create();
        }, "Initializer returned invalid type");

        troop.Base.init = function (arg) {
            return troop.Base; // prototype won't match
        };
        raises(function () {
            instance2 = troop.Base.create();
        }, "Initializer returned descendant with invalid prototype");

        delete troop.Base.init;

        raises(
            function () {
                instance1 = troop.Base.create('testArgument');
            },
            "Class doesn't implement .init method"
        );
    });

    test("Extension", function () {
        var derived,
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

        deepEqual(derived, {
            yo: "momma",
            foo: testMethod,
            init: init
        }, "Public class members");

        equal(derived._hello, "world", "Private class member");

        instance = derived.create();

        deepEqual(instance, {
            yo: "momma",
            foo: testMethod,
            init: init,
            holy: "moly",
            pi: 3.14
        }, "Public instance members");

        equal(instance._woo, "hoo", "Private instance member");

        equal(instance.getBase(), derived, "Instance extends from derived");
        equal(derived.getBase(), troop.Base, "Derived extends from troop.Base");
        equal(troop.Base.getBase(), Object.prototype, "Troop.Base extends from Object.prototype");
    });
}());
