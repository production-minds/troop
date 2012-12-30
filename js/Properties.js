/**
 * Property Management.
 *
 * Adding properties and methods to a class or instance.
 */
/*global dessert, troop, console */
(function (Base) {
    var self;

    dessert
        .addTypes({
            /**
             * Checks whether properties of `expr` are *all* functions.
             * @param expr {object}
             * @return {Boolean}
             */
            isAllFunctions: function (expr) {
                var methodName,
                    result = true;

                result = result && this.isObject(expr);

                for (methodName in expr) {
                    if (expr.hasOwnProperty(methodName)) {
                        result = result && this.isFunction(expr[methodName]);
                    }
                }

                return result;
            },

            /**
             * Checks property names against prefix.
             * @param expr {object} Host object.
             * @param prefix {string} Prefix.
             * @return {boolean} Whether all properties on the object satisfy the prefix condition.
             */
            isAllPrefixed: function (expr, prefix) {
                var propertyName;

                if (!this.isString(prefix)) {
                    // failed on argument type
                    return false;
                }

                for (propertyName in expr) {
                    if (expr.hasOwnProperty(propertyName)) {
                        if (propertyName.substr(0, prefix.length) !== prefix) {
                            // prefix doesn't match property name
                            return false;
                        }
                    }
                }

                return true;
            },

            /**
             * Tells whether an object holds a getter / setter pair.
             * @param expr {object} Host object.
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
             * @param trait {object} Trait object.
             * @param [host] {object} Host object.
             */
            isTrait: function (trait, host) {
                if (this.isPlainObject(trait)) {
                    // plain object qualifies as trait in itself
                    return true;
                } else if (!this.isObject(trait) || !this.isObject(host)) {
                    // otherwise both trait and host must be objects
                    return false;
                }

                var traitBase = Base.getBase.call(trait),
                    hostBase = Base.getBase.call(host);

                return traitBase === hostBase ||
                       traitBase.isPrototypeOf(hostBase);
            }
        });

    self = troop.Properties = {
        //////////////////////////////
        // Core

        /**
         * Assigns a property to the object using an ES5 property descriptor.
         * Uses either Object.defineProperty, or assignment.
         * @param object {object}
         * @param propertyName {string}
         * @param descriptor {object} ES5 property descriptor.
         * @private
         * @static
         */
        _defineProperty: function (object, propertyName, descriptor) {
            if (troop.sloppy && descriptor.hasOwnProperty('value')) {
                // in sloppy mode, value definitions revert to simple assignments
                object[propertyName] = descriptor.value;
            } else {
                Object.defineProperty(object, propertyName, descriptor);
            }
        },

        /**
         * Adds single value property.
         * @param propertyName {string} Property name.
         * @param value {*} Property value to be assigned.
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @private
         */
        _addValue: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
            dessert
                .isString((propertyName))
                .isBooleanOptional(isWritable)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            self._defineProperty(this, propertyName, {
                value       : value,
                writable    : isWritable || troop.messy,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds single accessor property.
         * @param propertyName {string} Property name.
         * @param [getter] {function} Property getter.
         * @param [setter] {function} Property setter.
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @private
         */
        _addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
            dessert
                .isString((propertyName))
                .isFunctionOptional(getter)
                .isFunctionOptional(setter)
                .isBooleanOptional(isEnumerable)
                .isBooleanOptional(isConfigurable);

            self._defineProperty(this, propertyName, {
                get         : getter,
                set         : setter,
                enumerable  : isEnumerable,
                configurable: isConfigurable
            });
        },

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param properties {object|function} Property object or its generator function.
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         */
        add: function (properties, isWritable, isEnumerable, isConfigurable) {
            var propertyName, property;

            if (typeof properties === 'function') {
                // when function is passed as 'properties'
                // generating property object
                properties = properties.call(this);
            }

            dessert.isObject(properties);

            for (propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    property = properties[propertyName];

                    if (dessert.isAccessor(property, true)) {
                        self._addAccessor.call(this,
                            propertyName,
                            property.get,
                            property.set,
                            isEnumerable,
                            isConfigurable
                        );
                    } else {
                        self._addValue.call(this,
                            propertyName,
                            property,
                            isWritable,
                            isEnumerable,
                            isConfigurable
                        );
                    }
                }
            }

            return this;
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @this {troop.Base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (methods) {
            dessert.isAllFunctions(methods);

            self.add.call(Base.getTarget.call(this), methods, false, true, false);

            return this;
        },

        /**
         * Adds private read-only methods to class.
         * @this {troop.Base} Class object.
         * @param methods {object} Methods.
         */
        addPrivateMethod: function (methods) {
            dessert
                .isAllFunctions(methods)
                .isAllPrefixed(methods, troop.privatePrefix);

            self.add.call(Base.getTarget.call(this), methods, false, false, false);

            return this;
        },

        /**
         * Copies properties and methods from an object
         * and adds them preserving all property attributes.
         * In testing mode, only copies methods!
         * @param trait {object} Object containing traits.
         */
        addTrait: function (trait) {
            // obtaining all property names (including non-enumerable)
            var traitTarget = Base.getTarget.call(trait),
                hostTarget = Base.getTarget.call(this),
                propertyNames,
                i, propertyName;

            dessert
                .isTrait(trait, this, "Trait doesn't satisfy common ancestor requirement.");

            propertyNames = Object.getOwnPropertyNames(traitTarget);
            for (i = 0; i < propertyNames.length; i++) {
                propertyName = propertyNames[i];
                self._defineProperty(
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
         * @param properties {object} Properties and methods.
         */
        addPublic: function (properties) {
            return self.add.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.Base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix);

            self.add.call(this, properties, true, false, false);

            return this;
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.Base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (properties) {
            return self.add.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.Base} Instance object.
         * @param properties {object} Constant properties.
         */
        addPrivateConstant: function (properties) {
            dessert.isAllPrefixed(properties, troop.privatePrefix);

            self.add.call(this, properties, false, false, false);

            return this;
        },

        /**
         * Elevates method from class level to instance level.
         * (Or from base class to child class.)
         * Ties context to the object it was elevated to.
         * @param methodName {string} Name of method to elevate.
         */
        elevateMethod: function (methodName) {
            dessert.isString(methodName);

            var that = this, // instance or child class
                base = Base.getBase.call(this), // class or base class
                methods;

            if (typeof base[methodName] === 'function') {
                methods = {};
                methods[methodName] = function () {
                    return base[methodName].apply(that, arguments);
                };
                self.addMethod.call(this, methods);
            }

            return this;
        },

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.Base} Instance or class object.
         * @param methods {object} Mock methods.
         */
        addMock: function (methods) {
            dessert.isAllFunctions(methods);

            self.add.call(this, methods, false, true, true);

            return this;
        },

        /**
         * Removes all mock methods from class or instance.
         */
        removeMocks: function () {
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key) && typeof this[key] === 'function') {
                    delete this[key];
                }
            }
            return this;
        }
    };

    self.addMethod.call(troop.Base, {
        addConstant       : self.addConstant,
        addMethod         : self.addMethod,
        addPrivate        : self.addPrivate,
        addPrivateConstant: self.addPrivateConstant,
        addPrivateMethod  : self.addPrivateMethod,
        addPublic         : self.addPublic,
        addPublicConstant : self.addConstant,
        addPublicMethod   : self.addMethod,
        addTrait          : self.addTrait,
        elevateMethod     : self.elevateMethod,
        addMock           : self.addMock,
        removeMocks       : self.removeMocks
    });

    self.addPublic.call(troop, {
        /**
         * Prefix applied to names of private properties and methods.
         */
        privatePrefix: '_',

        /**
         * When true, plain assignment is used instead of ES5 property
         * definition when applying properties.
         */
        sloppy: false,

        /**
         * When true, all properties are writable, so they can be
         * modified through assignment.
         */
        messy: false
    });
}(troop.Base));
