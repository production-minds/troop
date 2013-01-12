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

    test("Surrogate addition", function () {
        var filter = function () {},
            base = troop.Base.extend()
                .addMethod({
                    init: function () {}
                }),
            child = base.extend()
                .addMethod({
                    init: function () {}
                }),
            ns = {
                base : base,
                child: child
            };

        ok(!base.hasOwnProperty('surrogates'), "Class doesn't have surrogates");

        base.addSurrogate(ns, 'child', filter);

        equal(base.surrogates.length, 1, "New number of surrogates");

        deepEqual(
            base.surrogates,
            [
                {
                    namespace: ns,
                    className: 'child',
                    filter   : filter
                }
            ],
            "Surrogate info"
        );
    });

    test("Finding surrogate", function () {
        var ns = {};

        ns.base = troop.Base.extend()
            .addSurrogate(ns, 'child', function (test) {
                ok("Filter triggered");
                if (test === 'test') {
                    return true;
                }
            });

        ns.child = ns.base.extend();

        equal(Instantiation._getSurrogate.call(ns.base, 'test'), ns.child, "Arguments fit surrogate");
        equal(Instantiation._getSurrogate.call(ns.base, 'blah'), undefined, "Arguments don't fit a surrogate");
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

    test("Base validation", function () {
        ok(Instantiation.isA.call({}, Object.prototype), "{} is an Object.prototype");
        ok(Instantiation.isA.call([], Array.prototype), "[] is an Array.prototype");

        var myBase = troop.Base.extend()
                .addMethod({init: function () {}}),
            myChild = myBase.extend()
                .addMethod({init: function () {}});

        ok(Instantiation.instanceOf.call(myChild, myBase), "Direct descendant");
        ok(Instantiation.instanceOf.call(myBase, troop.Base), "Direct descendant");
        ok(!Instantiation.instanceOf.call(myChild, troop.Base), "Not direct descendant");

        ok(Instantiation.isA.call(myChild, troop.Base), "Not direct descendant");
    });
}(
    troop.Instantiation,
    troop.Feature
));
