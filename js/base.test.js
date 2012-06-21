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

}());
