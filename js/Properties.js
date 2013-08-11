/**
 * Property Management.
 *
 * Adding properties and methods to a class or instance.
 */
/*global dessert, troop, console */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    dessert.addTypes(/** @lends dessert */{
        /**
         * Checks whether host object has propertyName defined as its
         * own property.
         * @param {string} propertyName
         * @param {object} host
         * @returns {Boolean}
         */
        isPropertyNameAvailable: function (propertyName, host) {
            return !hOP.call(host, propertyName);
        },

        /**
         * Checks property names against prefix.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         * @returns {boolean} Whether all properties on the object satisfy the prefix condition.
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
         * @returns {boolean}
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
         * Adds single value property to the context.
         * @this {troop.Base}
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
         * Adds single accessor property to the context.
         * @this {troop.Base}
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
         * Adds a block of properties to the context having the specified attributes.
         * @this {troop.Base}
         * @param {object|function} properties Property object or its generator function.
         * @param {boolean} [isWritable]
         * @param {boolean} [isEnumerable]
         * @param {boolean} [isConfigurable]
         * @returns {troop.Base}
         */
        addProperties: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyNames = Object.keys(properties),
                i, propertyName, property;

            for (i = 0; i < propertyNames.length; i++) {
                // making sure property name is available
                propertyName = propertyNames[i];
                dessert.isPropertyNameAvailable(propertyName, this, "Direct property conflict");

                // adding accessor / property
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

    troop.Base.addMethods(/** @lends troop.Base# */{
        /**
         * Adds a block of public read-only methods to the class it's called on.
         * When troop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = troop.extend()
         *    .addMethods({
         *        foo: function () {alert("Foo");},
         *        bar: {get: function () {return "Bar";}
         *    });
         * @returns {troop.Base}
         */
        addMethods: function (methods) {
            dessert.isAllFunctions(methods);

            self.addProperties.call(troop.Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds a block of private (non-enumerable) read-only methods to the class it's called on.
         * Method names must match the private prefix rule set by `troop.privatePrefix`.
         * When troop.testing is on, methods will be placed on the class differently than other properties,
         * therefore it is important to use .addMethods and .addPrivateMethods for method addition.
         * @param {object} methods Name - value pairs of methods to apply. Values must be functions,
         * or objects implementing a pair of get and set functions.
         * @example
         * var myClass = troop.extend()
         *    .addMethods({
         *        _foo: function () {alert("Foo");},
         *        _bar: {get: function () {return "Bar";}
         *    });
         * @returns {troop.Base}
         */
        addPrivateMethods: function (methods) {
            dessert
                .isAllFunctions(methods, "Some private methods are not functions.")
                .isAllPrefixed(methods, troop.privatePrefix, "Some private method names do not match the required prefix.");

            self.addProperties.call(troop.Base.getTarget.call(this), methods, false, false, false);

            return this;
        },

        /**
         * Adds a trait to the current class.
         * A trait is similar to a class, in that it is a collection of properties and methods. In the process,
         * all own properties and methods of the trait get copied to the current class, preserving their
         * ES5 property attributes.
         * Traits must satisfy an inheritance requirement, inasmuch as they must be either plain objects (extending
         * Object.prototype), or direct extensions of troop.Base, or the trait and current class must share
         * the same base class. Traits are not required to have an .init() method.
         * In testing mode, copies methods only!
         * @param {object|troop.Base} trait Trait object
         * @example
         * MyTrait = troop.Base.extend()
         *    .addMethods({
         *        foo: function () { alert("hello"); }
         *    });
         * MyClass = troop.Base.extend()
         *    .addTrait(MyTrait)
         *    .addMethods({ init: function () {} });
         * myInstance = MyClass.create();
         * myInstance.foo(); // alerts "hello"
         * @returns {troop.Base}
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

        /**
         * Adds a block of public (enumerable) writable properties to the current class or instance.
         * @param {object} properties Name-value pairs of properties.
         * @returns {troop.Base}
         */
        addPublic: function (properties) {
            self.addProperties.call(this, properties, true, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) writable properties to the current class or instance.
         * Property names must match the private prefix rule set by `troop.privatePrefix`.
         * @param {object} properties Name-value pairs of properties.
         * @returns {troop.base}
         */
        addPrivate: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private property names do not match the required prefix.");

            self.addProperties.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds a block of public (enumerable) constant (read-only) properties to the current class or instance.
         * @param {object} properties Name-value pairs of constant properties
         * @returns {troop.Base}
         */
        addConstants: function (properties) {
            self.addProperties.call(this, properties, false, true, false);
            return this;
        },

        /**
         * Adds a block of private (non-enumerable) constant (read-only) properties to the current class or instance.
         * Property names must match the private prefix rule set by `troop.privatePrefix`.
         * @param {object} properties Name-value pairs of private constant properties.
         * @returns {troop.Base}
         */
        addPrivateConstants: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private constant names do not match the required prefix.");

            self.addProperties.call(this, properties, false, false, false);

            return this;
        },

        /**
         * Elevates method from class level to instance level. (Or from base class to current class.)
         * Ties context to the object it was elevated to, so methods may be safely passed as event handlers.
         * @param {string} methodName Name of method to elevate.
         * @example
         * ClassA = troop.Base.extend()
         *    .addMethods({
         *        init: function () {},
         *        foo: function () { alert(this.bar); }
         *    });
         * ClassB = ClassA.extend()
         *     .addMethods({
         *         init: function () {
         *             this.bar = "hello";
         *             this.elevateMethod('foo');
         *         }
         *     });
         * foo = ClassB.create().foo; // should lose context
         * foo(); // alerts "hello", for context was preserved
         * @returns {troop.Base}
         */
        elevateMethod: function (methodName) {
            dessert.isString(methodName, "Invalid method name");

            var base = this.getBase(), // class or base class
                baseMethod = base[methodName],
                elevatedMethod;

            dessert.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

            elevatedMethod = {};
            elevatedMethod[methodName] = baseMethod.bind(this);
            troop.Base.addMethods.call(this, elevatedMethod);

            return this;
        },

        /**
         * Adds a block of public (enumerable) mock methods (read-only, but removable) to the current instance or class.
         * @param {object} methods Name-value pairs of methods. Values must be functions or getter-setter objects.
         * @example
         * troop.testing = true;
         * MyClass = troop.Base.extend()
         *      .addMethods({
         *          init: function () {},
         *          foo: function () {}
         *      });
         * myInstance = MyClass.create();
         * MyClass.addMocks({
         *     foo: function () {return 'FOO';}
         * });
         * myInstance.foo() // returns 'FOO'
         * @see troop.Base#addMethods
         * @returns {troop.Base}
         */
        addMocks: function (methods) {
            dessert
                .assert(troop.testing, "Troop is not in testing mode.")
                .isAllFunctions(methods, "Some mock methods are not functions.");

            self.addProperties.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from the current class or instance.
         * @returns {troop.Base}
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
