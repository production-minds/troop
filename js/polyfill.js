/**
 * ECMAScript 4 compatibility layer.
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
            var result = {
                writable: true,
                enumerable: true,
                configurable: true
            };

            if (obj.hasOwnProperty(prop)) {
                result.value = obj[prop];
            }

            return result;
        },

        defineProperty: function (obj, prop, desc) {
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
        }
    };

    if (typeof Object.getPrototypeOf !== 'function') {
        Object.getPrototypeOf = self.getPrototypeOf;
    }

    if (typeof Object.getOwnPropertyNames !== 'function') {
        Object.getOwnPropertyNames = self.getOwnPropertyNames;
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
}());
