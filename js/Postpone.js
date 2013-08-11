/**
 * Postponed Property Definition.
 *
 * API to add properties to objects so that they won't get evaluated until
 * first access.
 */
/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    troop.Base.addMethods.call(troop, /** @lends troop */{
        /**
         * Postpones a property definition on the specified object until first access.
         * Initially assigns a special getter to the property, then, when the property is accessed for the first time,
         * the property is assigned the return value of the generator function, unless a value has been assigned from
         * within the generator.
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} generator Generates (and returns) property value. Arguments: host object, property name,
         * plus all extra arguments passed to .postpone().
         * @example
         * var obj = {};
         * troop.postpone(obj, 'foo', function () {
         *    return "bar";
         * });
         * obj.foo // runs generator and alerts "bar"
         */
        postpone: function (host, propertyName, generator) {
            dessert
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(generator, "Invalid generator function");

            var sliceArguments = Array.prototype.slice.bind(arguments),
                generatorArguments;

            // checking whether property is already defined
            if (hOP.call(host, propertyName)) {
                return;
            }

            // rounding up rest of the arguments
            generatorArguments = sliceArguments(0, 2).concat(sliceArguments(3));

            // placing class placeholder on namespace as getter
            Object.defineProperty(host, propertyName, {
                get: function () {
                    // obtaining property value
                    var value = generator.apply(this, generatorArguments);

                    if (typeof value !== 'undefined') {
                        // generator returned a property value
                        // overwriting placeholder with actual property value
                        Object.defineProperty(host, propertyName, {
                            value       : value,
                            writable    : false,
                            enumerable  : true,
                            configurable: false
                        });
                    } else {
                        // no return value
                        // generator supposedly assigned value to property
                        value = host[propertyName];
                    }

                    return value;
                },

                set: function (value) {
                    // overwriting placeholder with property value
                    Object.defineProperty(host, propertyName, {
                        value       : value,
                        writable    : false,
                        enumerable  : true,
                        configurable: false
                    });
                },

                enumerable  : true,
                configurable: true  // must be configurable in order to be re-defined
            });
        }
    });
}());
