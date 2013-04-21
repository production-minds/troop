/**
 * Surrogate unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect, raises */
var globalNs = {};

(function () {
    "use strict";

    module("Surrogate");

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

        equal(troop.Surrogate.getSurrogate.call(ns.base, 'test'), ns.child, "Arguments fit surrogate");
        equal(troop.Surrogate.getSurrogate.call(ns.base, 'blah'), undefined, "Arguments don't fit a surrogate");
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

        globalNs.child = child;

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
}());