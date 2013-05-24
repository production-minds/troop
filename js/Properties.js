/**
 * Property Management.
 *
 * Adding properties and methods to a class or instance.
 */
/*global dessert, troop, console */
(function () {
    "use strict";

    dessert.addTypes(/** @lends dessert */{
        /**
         * Checks property names against prefix.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         * @return {boolean} Whether all properties on the object satisfy the prefix condition.
         */
        isAllPrefixed: function (expr, prefix) {
            var propertyNames,
                i;

            if (!this.isString(prefix) || !this.isPlainObject(expr)) {
                return false;
            }

            propertyNames = Object.keys(expr);
            for (i = 0; i < propertyNames.length; i++) {
                if (propertyNames[i].substr(0, prefix.length) !== prefix) {
                    // prefix doesn't match property name
                    return false;
                }
            }

            return true;
        },

        /**
         * Tells whether an object holds a getter / setter pair.
         * @param {object} expr Host object.
         * @return {boolean}
         */
        isAccessor: function (expr) {
            var accessorMethods = {
                'get'    : true,
                'set'    : true,
                'get,set': true,
                'set,get': true
            };

            return this.isPlainObject(expr) &&
                   this.isAllFunctions(expr) &&
                   Object.getOwnPropertyNames(expr).join(',') in accessorMethods;
        },

        /**
         * Validates an object for being trait in the context of a host object.
         * Compares the immediate base classes of the trait and the host.
         * @param {object} trait Trait object.
         * @param {object} [host] Host object.
         */
        isTrait: function (trait, host) {
            if (this.isPlainObject(trait)) {
                // plain object qualifies as trait in itself
                return true;
            } else if (!this.isObject(trait) || !this.isObject(host)) {
                // otherwise both trait and host must be objects
                return false;
            }

            var traitBase = troop.Base.getBase.call(trait),
                hostBase = troop.Base.getBase.call(host);

            return traitBase === hostBase ||
                   traitBase.isPrototypeOf(hostBase);
        }
    });

    /**
     * @class troop.Properties
     */
    troop.Properties = {
        /**
         * Adds single value property.
         * @param {string} propertyName Property name.
         * @param value {*} Property value to be assigned.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addProperty: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            dessert
                .isString(propertyName, "Invalid property name")
                .isBooleanOptional(isWritable)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || troop.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property.
         * @param {string} propertyName Property name.
         * @param {function} [getter] Property getter.
         * @param {function} [setter] Property setter.
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
            dessert
                .isString(propertyName, "Invalid property name")
                .isFunctionOptional(getter)
                .isFunctionOptional(setter)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            Object.defineProperty(this, propertyName, {
                get         : getter,
                set         : setter,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param {object|function} properties Property object or its generator function.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         */
        addProperties: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyNames = Object.keys(properties),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                // current property
                propertyName = propertyNames[i];
                property = properties[propertyName];

                if (dessert.validators.isAccessor(property)) {
                    self.addAccessor.call(this,
                        propertyName,
                        property.get,
                        property.set,
                        isEnumerable,
                        isConfigurable
                    );
                } else {
                    self.addProperty.call(this,
                        propertyName,
                        property,
                        isWritable,
                        isEnumerable,
                        isConfigurable
                    );
                }
            }

            return this;
        }
    };

    var self = troop.Properties;

    troop.Base.addMethod(/** @lends troop.Base */{
        /**
         * Adds public read-only methods to class.
         * @this {troop.Base} Class object.
         * @param {object} methods Methods.
         */
        addMethod: function (methods) {
            dessert.isAllFunctions(methods);

            self.addProperties.call(troop.Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds private read-only methods to class.
         * @this {troop.Base} Class object.
         * @param {object} methods Methods.
         */
        addPrivateMethod: function (methods) {
            dessert
                .isAllFunctions(methods, "Some private methods are not functions.")
                .isAllPrefixed(methods, troop.privatePrefix, "Some private method names do not match the required prefix.");

            self.addProperties.call(troop.Base.getTarget.call(this), methods, false, false, false);

            return this;
        },

        /**
         * Copies properties and methods from an object
         * and adds them preserving all property attributes.
         * In testing mode, only copies methods!
         * @param {object} trait Object containing traits.
         */
        addTrait: function (trait) {
            // obtaining all property names (including non-enumerable)
            var traitTarget = troop.Base.getTarget.call(trait),
                hostTarget = troop.Base.getTarget.call(this),
                propertyNames,
                i, propertyName;

            dessert.isTrait(trait, this, "Trait doesn't satisfy common ancestor requirement.");

            propertyNames = Object.getOwnPropertyNames(traitTarget);
            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                Object.defineProperty(
                    hostTarget,
                    propertyName,
                    Object.getOwnPropertyDescriptor(traitTarget, propertyName)
                );
            }

            return this;
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public writable members to class or instance.
         * @this {troop.Base} Class or instance object.
         * @param {object} properties Properties and methods.
         */
        addPublic: function (properties) {
            return self.addProperties.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.Base} Class or instance object.
         * @param {object} properties Properties and methods.
         */
        addPrivate: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private property names do not match the required prefix.");

            self.addProperties.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.Base} Instance object.
         * @param {object} properties Constant properties.
         */
        addConstant: function (properties) {
            return self.addProperties.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.Base} Instance object.
         * @param {object} properties Constant properties.
         */
        addPrivateConstant: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private constant names do not match the required prefix.");

            self.addProperties.call(this, properties, false, false, false);

            return this;
        },

        /**
         * Elevates method from class level to instance level.
         * (Or from base class to child class.)
         * Ties context to the object it was elevated to.
         * @param {string} methodName Name of method to elevate.
         */
        elevateMethod: function (methodName) {
            dessert.isString(methodName, "Invalid method name");

            var base = this.getBase(), // class or base class
                baseMethod = base[methodName],
                elevatedMethod;

            dessert.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

            elevatedMethod = {};
            elevatedMethod[methodName] = baseMethod.bind(this);
            troop.Base.addMethod.call(this, elevatedMethod);

            return this;
        },

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.Base} Instance or class object.
         * @param {object} methods Mock methods.
         */
        addMock: function (methods) {
            dessert.isAllFunctions(methods, "Some mock methods are not functions.");

            self.addProperties.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from class or instance.
         */
        removeMocks: function () {
            var propertyNames = Object.keys(this),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                property = this[propertyName];
                if (typeof property === 'function' && !(property instanceof RegExp)) {
                    /**
                     * All enumerable function properties are considered mocks
                     * and will be removed (unless non-configurable).
                     * RegExp check: in older browsers (eg. Safari 4.0.5) typeof /regexp/
                     * evaluates to 'function' and should be excluded.
                     */
                    delete this[propertyName];
                }
            }

            return this;
        }
    });

    troop.Base.addPublic.call(troop, /** @lends troop */{
        /**
         * Prefix applied to names of private properties and methods.
         * @type {string}
         */
        privatePrefix: '_',

        /**
         * When true, all properties are writable, so they can be
         * modified through assignment.
         * @type {boolean}
         */
        messy: false
    });
}());
