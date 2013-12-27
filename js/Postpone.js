/**
 * Postponed Property Definition.
 *
 * API to add properties to objects so that they won't get evaluated until
 * first access.
 */
/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        splice = Array.prototype.splice;

    dessert.addTypes(/** @lends dessert */{
        /**
         * Determines whether a property descriptor is a getter-setter.
         * @param {object} propertyDescriptor
         */
        isSetterGetterDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'get') &&
                   hOP.call(propertyDescriptor, 'set') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        },

        /**
         * Determines whether a property descriptor is a value property.
         * @param {object} propertyDescriptor
         */
        isValueDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'value') &&
                   hOP.call(propertyDescriptor, 'writable') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        }
    });

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

            // checking whether property is already defined
            if (hOP.call(host, propertyName)) {
                return;
            }

            // preparing generator argument list
            var generatorArguments = slice.call(arguments);
            splice.call(generatorArguments, 2, 1);

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
        },

        /**
         * Applies a modifier to the postponed property to be called AFTER the property is resolved.
         * Amendments are resolved in the order they were applied.
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} modifier Amends property value. Arguments: host object, property name,
         * plus all extra arguments passed to .amendPostponed(). Return value is discarded.
         */
        amendPostponed: function (host, propertyName, modifier) {
            dessert
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(modifier, "Invalid generator function");

            var modifierArguments = slice.call(arguments),
                propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName),
                propertyGetter,
                amendments;

            // removing modifier from argument list
            splice.call(modifierArguments, 2, 1);

            if (dessert.validators.isSetterGetterDescriptor(propertyDescriptor)) {
                // property is setter-getter, ie. unresolved
                propertyGetter = propertyDescriptor.get;
                dessert.isFunction(propertyGetter, "Invalid postponed property");

                // adding generator to amendment functions
                amendments = propertyGetter.amendments = propertyGetter.amendments || [];
                amendments.push({
                    modifier: modifier,
                    args    : modifierArguments
                });
            } else {
                // property is value, assumed to be a resolved postponed property

                // calling modifier immediately
                modifier.apply(this, modifierArguments);
            }
        }
    });
}());
