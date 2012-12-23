/**
 * Base class unit tests
 */
/*global troop, module, test, ok, equal, notEqual, deepEqual, raises, expect, mock, unMock */
(function (Base) {
    module("Base");

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
}(troop.Base));
