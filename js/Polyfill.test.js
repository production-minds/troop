/**
 * ECMAScript 4 compatibility tests.
 */
/*global troop, module, test, expect, ok, equal, notEqual, deepEqual, raises */
(function (Polyfill) {
    module("Polyfill");

    test("Basic", function () {
        equal(Polyfill.getPrototypeOf([]), Array.prototype, "Array prototype");

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
            result,
            tmp;

        result = Polyfill.defineProperty(o, 'p1', {value: 5});
        equal(result, o, "Returns host object");
        equal(o.p1, 5, "Value assignment");

        Polyfill.defineProperty(o, 'p2', {get: function () {return tmp + 'foo';}});
        tmp = '';
        equal(o.p2, 'foo', "Getter 1");

        tmp = 'a';
        equal(o.p2, 'afoo', "Getter 2");

        Polyfill.defineProperty(o, 'p3', {get: function () {return tmp;}, set: function (x) {tmp = x * 2;}});
        o.p3 = 3;

        equal(o.p3, 6, "Setter");

        Polyfill.defineProperty(o, 'p4', {value: 'hello'});
        equal(o.p4, 'hello', "Property starts out as value");
        equal(typeof o.__lookupGetter__('p4'), 'undefined', "Value property has no getter");

        tmp = 'boo';
        Polyfill.defineProperty(o, 'p4', {
            get: function () { return tmp;},
            set: function (x) { tmp = x;}
        });
        equal(typeof o.__lookupGetter__('p4'), 'function', "Property getter");
        equal(typeof o.__lookupSetter__('p4'), 'function', "Property setter");
        equal(o.p4, 'boo', "Property value provided by getter");

        Polyfill.defineProperty(o, 'p4', {get: function () { return 'world';}});
        equal(typeof o.__lookupGetter__('p4'), 'function', "Property getter");
        equal(typeof o.__lookupSetter__('p4'), 'undefined', "No setter defined");
        equal(o.p4, 'world', "Property value provided by getter");
    });

    test(".getOwnPropertyDescriptor", function () {
        var o = {};

        o.p1 = 'foo';
        deepEqual(
            Polyfill.getOwnPropertyDescriptor(o, 'p1'),
            {
                writable: true,
                enumerable: true,
                configurable: true,
                value: 'foo'
            },
            "Value-property descriptor OK"
        );

        function getter() {return 'foo';}

        o.__defineGetter__('p2', getter);
        deepEqual(
            Polyfill.getOwnPropertyDescriptor(o, 'p2'),
            {
                writable: true,
                enumerable: true,
                configurable: true,
                get: getter
            },
            "Getter-property descriptor OK"
        );
    });

    test(".create", function () {
        var base = {},
            child1 = Polyfill.create(base, {test: {value: 'tset'}});

        equal(child1.constructor.prototype, base, "Immediate prototype");
        equal(child1.test, 'tset', "Applied property");
    });
}(
    troop.Polyfill
));
