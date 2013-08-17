/*global phil, dessert, troop, module, test, expect, ok, equal, notEqual, strictEqual, deepEqual, raises */
(function () {
    "use strict";

    module("Documented");

    test("Instantiation", function () {
        var MyDocumented = troop.Base.extend()
                .addTrait(troop.Documented)
                .extend('MyDocumented'),
            nextInstanceId = troop.Documented.nextInstanceId,
            myInstance;

        equal(MyDocumented.className, 'MyDocumented', "Class name");

        myInstance = MyDocumented.create();

        equal(myInstance.instanceId, nextInstanceId, "Assigned instance ID");

        equal(troop.Documented.nextInstanceId, nextInstanceId + 1, "Incremented instance ID");
    });
}());
