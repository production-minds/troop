/**
 * Inheritance unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect, raises */
(function (Instantiation, Feature) {
    module("Instantiation");

    test("Instantiation", function () {
        var myClass = troop.Base.extend(),
            instance1, instance2;

        expect(5);

        myClass.init = function (arg) {
            this.test = "bar";
            equal(arg, 'testArgument', "Class init called");
        };
        instance1 = myClass.create('testArgument');
        equal(instance1.test, "bar", "Instance initialized");

        myClass.init = function () {
            return instance1;
        };
        instance2 = myClass.create();
        equal(instance2, instance1, "Instantiation returned a different object");

        myClass.init = function () {
            return 5; // invalid type to return here
        };
        raises(function () {
            instance2 = myClass.create();
        }, "Initializer returned invalid type");

        delete myClass.init;

        raises(
            function () {
                instance1 = troop.Base.create('testArgument');
            },
            "Class doesn't implement .init method"
        );
    });

    test("Surrogate integration test", function () {
        var ns = {};

        ns.base = troop.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("Filter triggered");
                if (test === 'test') {
                    return true;
                }
            })
            .addMethod({
                init: function () {}
            });

        ns.child = ns.base.extend()
            .addMethod({
                init: function (test) {
                    equal(test, 'test', "Argument passed to filter");
                }
            });

        expect(6);

        // triggers filter & init
        ok(ns.base.create('test').isA(ns.child), "Triggered filter changes class");

        // triggers filter only
        equal(ns.base.create('blah').isA(ns.child), false, "Constructor args don't satisfy filter");

        // triggers init only
        ns.child.create('test');
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
}(
    troop.Instantiation,
    troop.Feature
));
