/**
 * Property Management.
 *
 * Adding properties and methods to a class or instance.
 */
/*global dessert, troop, console */
(function (Base) {
    var self;

    dessert.addTypes({
        /**
         * Checks property names against prefix.
         * @param {object} expr Host object.
         * @param {string} prefix Prefix.
         * @return {boolean} Whether all properties on the object satisfy the prefix condition.
         */
        isAllPrefixed: function (expr, prefix) {
            var propertyName;

            if (!this.isString(prefix) || !this.isPlainObject(expr)) {
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

            var traitBase = Base.getBase.call(trait),
                hostBase = Base.getBase.call(host);

            return traitBase === hostBase ||
                   traitBase.isPrototypeOf(hostBase);
        }
    });

    self = troop.Properties = Base.extend()
        .addPrivateMethod({
            /**
             * Assigns a property to the object using an ES5 property descriptor.
             * Uses either Object.defineProperty, or assignment.
             * @param {object} object
             * @param {string} propertyName
             * @param {object} descriptor ES5 property descriptor.
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
             * @param {string} propertyName Property name.
             * @param value {*} Property value to be assigned.
             * @param {boolean} [isWritable]
             * @param {boolean} [isEnumerable]
             * @param {boolean} [isConfigurable]
             * @private
             */
            _addValue: function (propertyName, value, isWritable, isEnumerable, isConfigurable) {
                dessert
                    .isString(propertyName, "Invalid property name")
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
             * @param {string} propertyName Property name.
             * @param {function} [getter] Property getter.
             * @param {function} [setter] Property setter.
             * @param {boolean} [isEnumerable]
             * @param {boolean} [isConfigurable]
             * @private
             */
            _addAccessor: function (propertyName, getter, setter, isEnumerable, isConfigurable) {
                dessert
                    .isString(propertyName, "Invalid property name")
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
             * @param {object|function} properties Property object or its generator function.
             * @param {boolean} [isWritable]
             * @param {boolean} [isEnumerable]
             * @param {boolean} [isConfigurable]
             */
            _add: function (properties, isWritable, isEnumerable, isConfigurable) {
                var propertyName, property;

                for (propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        property = properties[propertyName];

                        if (dessert.validators.isAccessor(property)) {
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
            }
        })
        .addMethod({
            /**
             * Adds public read-only methods to class.
             * @this {troop.Base} Class object.
             * @param {object} methods Methods.
             */
            addMethod: function (methods) {
                dessert.isAllFunctions(methods);

                self._add.call(Base.getTarget.call(this), methods, false, true, false);

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

                self._add.call(Base.getTarget.call(this), methods, false, false, false);

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
                var traitTarget = Base.getTarget.call(trait),
                    hostTarget = Base.getTarget.call(this),
                    propertyNames,
                    i, propertyName;

                dessert.isTrait(trait, this, "Trait doesn't satisfy common ancestor requirement.");

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
             * @param {object} properties Properties and methods.
             */
            addPublic: function (properties) {
                return self._add.call(this, properties, true, true, false);
            },

            /**
             * Adds pseudo-private writable members to class or instance.
             * @this {troop.Base} Class or instance object.
             * @param {object} properties Properties and methods.
             */
            addPrivate: function (properties) {
                dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private property names do not match the required prefix.");

                self._add.call(this, properties, true, false, false);

                return this;
            },

            /**
             * Adds public constant (read-only) members to instance.
             * @this {troop.Base} Instance object.
             * @param {object} properties Constant properties.
             */
            addConstant: function (properties) {
                return self._add.call(this, properties, false, true, false);
            },

            /**
             * Adds private constant (read-only & non-enumerable) members to instance.
             * @this {troop.Base} Instance object.
             * @param {object} properties Constant properties.
             */
            addPrivateConstant: function (properties) {
                dessert.isAllPrefixed(properties, troop.privatePrefix, "Some private constant names do not match the required prefix.");

                self._add.call(this, properties, false, false, false);

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

                var base = Base.getBase.call(this), // class or base class
                    baseMethod = base[methodName],
                    elevatedMethod;

                dessert.isFunction(baseMethod, "Attempted to elevate non-method.", methodName);

                elevatedMethod = {};
                elevatedMethod[methodName] = baseMethod.bind(this);
                self.addMethod.call(this, elevatedMethod);

                return this;
            },

            /**
             * Adds public mock methods (read-only, but removable) members to instance or class.
             * @this {troop.Base} Instance or class object.
             * @param {object} methods Mock methods.
             */
            addMock: function (methods) {
                dessert.isAllFunctions(methods, "Some mock methods are not functions.");

                self._add.call(this, methods, false, true, true);

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
        });

    Base.addMethod({
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
