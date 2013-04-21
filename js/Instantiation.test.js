/**
 * Inheritance unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect, raises */
(function () {
    "use strict";

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

        /**
         * Base class for surrogate testing.
         */
        ns.base = troop.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("Filter triggered");
                if (test === 'test') {
                    return true;
                }
            })
            .addSurrogate(ns, 'initless', function (test) {
                return test === 'initless';
            })
            .addMethod({
                init: function () {}
            });

        /**
         * Child class that also serves as a surrogate for base.
         */
        ns.child = ns.base.extend()
            .addMethod({
                init: function (test) {
                    equal(test, 'test', "Argument passed to filter");
                }
            });

        /**
         * Init-less class for checking whether instantiation
         * verifies init() on the extended class.
         */
        ns.initless = ns.base.extend();

        expect(8);

        // triggers filter & init (1 + 2)
        ok(ns.base.create('test').isA(ns.child), "Triggered filter changes class");

        // triggers filter only (1 + 1)
        equal(ns.base.create('blah').isA(ns.child), false, "Constructor args don't satisfy filter");

        // triggers init only (1)
        ns.child.create('test');

        // triggers filter(s) only (1 + 1)
        ok(ns.base.create('initless').isA(ns.initless), "Init-less child class instantiated");

        // does not trigger anything (0)
        ns.initless.create('test');
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
}());
