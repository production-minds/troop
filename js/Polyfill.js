/**
 * ECMAScript 3 (JavaScript 1.5) compatibility layer.
 *
 * Intrusive: may overwrite / be overwritten by polyfill methods applied by other libs.
 */
/*global troop */
(function () {
    var self = troop.Polyfill = {
        getPrototypeOf: function (obj) {
            return obj.constructor.prototype;
        },

        getOwnPropertyNames: function (obj) {
            var result = [],
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result.push(key);
                }
            }
            return result;
        },

        getOwnPropertyDescriptor: function (obj, prop) {
            if (!obj.hasOwnProperty(prop)) {
                return undefined;
            }

            // basic properties
            var result = {
                    writable: true,
                    enumerable: true,
                    configurable: true
                },
                getter = obj.__lookupGetter__(prop),
                setter = obj.__lookupSetter__(prop);

            if (getter || setter) {
                // applying accessors when property is getter/setter
                if (getter) {
                    result.get = getter;
                }
                if (setter) {
                    result.set = setter;
                }
            } else {
                // applying value
                result.value = obj[prop];
            }

            return result;
        },

        defineProperty: function (obj, prop, desc) {
            // cleaning up
            delete obj[prop];

            if (desc.hasOwnProperty('value')) {
                // value assignment
                obj[prop] = desc.value;
            } else {
                // getter/setter
                if (typeof desc.get === 'function') {
                    obj.__defineGetter__(prop, desc.get);
                }
                if (typeof desc.set === 'function') {
                    obj.__defineSetter__(prop, desc.set);
                }
            }

            return obj;
        },

        /**
         * @param proto {object}
         * @param [props] {object}
         */
        create: function (proto, props) {
            function F() {}

            F.prototype = proto;

            var o = new F(),
                key;

            for (key in props) {
                if (props.hasOwnProperty(key)) {
                    self.defineProperty(o, key, props[key]);
                }
            }

            o.constructor = F;
            return o;
        },

        /**
         * Function.prototype.bind
         * It's a very crude approximation as compared to:
         * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind
         * @param that {Object} Externally supplied context
         * @return {function} Function with the supplied context tied to it.
         */
        functionBind: function (that) {
            var fn = this, // function to be bound
                slice = Array.prototype.slice,
                args = slice.call(arguments, 1);

            return function () {
                return fn.apply(that, args.concat(slice.call(arguments)));
            };
        }
    };

    if (typeof Object.getPrototypeOf !== 'function') {
        Object.getPrototypeOf = self.getPrototypeOf;
    }

    if (typeof Object.getOwnPropertyNames !== 'function') {
        Object.getOwnPropertyNames = self.getOwnPropertyNames;
    }

    if (typeof Object.keys !== 'function') {
        Object.keys = self.getOwnPropertyNames;
    }

    if (typeof Object.getOwnPropertyDescriptor !== 'function') {
        Object.getOwnPropertyDescriptor = self.getOwnPropertyDescriptor;
    }

    if (typeof Object.defineProperty !== 'function') {
        Object.defineProperty = self.defineProperty;
    }

    if (typeof Object.create !== 'function') {
        Object.create = self.create;
    }

    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = self.functionBind;
    }
}());
