/**
 * Base class unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, raises, expect, mock, unMock */
(function () {
    module("Base");

    test("Instantiation", function () {
        expect(3);

        troop.base.init = function (arg) {
            this.foo = "bar";
            equal(arg, 'testArgument', "Class init called");
        };

        var instance = troop.base.create('testArgument');

        equal(instance.foo, "bar", "Instance initialized");

        delete troop.base.init;

        raises(
            function () {
                instance = troop.base.create('testArgument');
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
                    woo: "hoo"
                }).addPublic({
                    holy: "moly"
                }).addConstant({
                    pi: 3.14
                });
        }

        derived = troop.base.extend()
            .addPrivate({
                hello: "world"
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

        equal(derived.p_hello, "world", "Private class member");

        instance = derived.create();

        deepEqual(instance, {
            yo: "momma",
            foo: testMethod,
            init: init,
            holy: "moly",
            pi: 3.14
        }, "Public instance members");

        equal(instance.p_woo, "hoo", "Private instance member");
    });
}());
