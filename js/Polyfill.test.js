/**
 * ECMAScript 4 compatibility tests.
 */
/*global troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
(function (Polyfill) {
    module("Polyfill");

    test("Basic", function () {
        equal(Polyfill.getPrototypeOf([]), Array.prototype, "Object prototype");

        var tmp = {foo: 'bar', hello: "world"};

        deepEqual(Polyfill.getOwnPropertyNames(tmp).sort(), ['foo', 'hello'], "Own property names");

        deepEqual(
            Polyfill.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                writable: true,
                enumerable: true,
                configurable: true,
                value: 'bar'
            },
            "String property descriptor"
        );
    });

    test(".defineProperty", function () {
        var o = {},
            tmp;

        Polyfill.defineProperty(o, 'p1', {value: 5});
        equal(o.p1, 5, "Value assignment");

        Polyfill.defineProperty(o, 'p2', {get: function () {return tmp + 'foo';}});
        tmp = '';
        equal(o.p2, 'foo', "Getter 1");

        tmp = 'a';
        equal(o.p2, 'afoo', "Getter 2");

        Polyfill.defineProperty(o, 'p3', {get: function () {return tmp;}, set: function (x) {tmp = x * 2;}});
        o.p3 = 3;

        equal(o.p3, 6, "Setter");
    });

    test(".create", function () {
        var base = {},
            child1 = Polyfill.create(base, {test: {value: 'tset'}}),
            child2 = Polyfill.create(base);

        equal(child1.constructor.prototype, base, "Immediate prototype");
        equal(child1.test, 'tset', "Applied property");
        deepEqual(child2, {}, "Content");
    });
}(
    troop.Polyfill
));
