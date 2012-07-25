/**
 * Property Management.
 *
 * Adding properties of different purposes to a class or instance.
 */
/*global troop, console */
(function () {
    var self = troop.properties = {
        //////////////////////////////
        // Utilities

        /**
         * Emits a warning message.
         * @param message {string}
         * @private
         */
        _warn: function (message) {
            if (typeof console.warn === 'function') {
                console.warn(message);
            }
        },

        /**
         * Assigns a property to the object using an ES5 property descriptor.
         * Faster, but sloppy alternative to Object.defineProperty()
         * @param object {object}
         * @param propertyName {string}
         * @param descriptor {object} ES5 property descriptor.
         * @private
         */
        _assign: function (object, propertyName, descriptor) {
            object[propertyName] = descriptor.value;
        },

        /**
         * Adds prefix to property name if it's not already there.
         * @param propertyName {string} Property name.
         * @param prefix {string} Prefix.
         * @return {string} Prefixed property name.
         * @private
         */
        _addPrefix: function (propertyName, prefix) {
            if (!prefix || propertyName.substr(0, prefix.length) === prefix) {
                // property name is already prefixed
                return propertyName;
            } else {
                // adding prefix
                self._warn("Adding prefix to property '" + propertyName + "'.");
                return prefix + propertyName;
            }
        },

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param properties {object}
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @param [prefix] {string} Property prefix. Added to all assigned properties.
         * @param [typeName] {string} Name of enforced type.
         */
        add: function (properties, isWritable, isEnumerable, isConfigurable, prefix, typeName) {
            var addProperty = troop.sloppy ?
                    self._assign :
                    Object.defineProperty,
                propertyName, property;

            for (propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    property = properties[propertyName];
                    if (!typeName || typeof property === typeName) {
                        addProperty(this, self._addPrefix(propertyName, prefix), {
                            value: property,
                            writable: isWritable || troop.messy,
                            enumerable: isEnumerable,
                            configurable: isConfigurable
                        });
                    } else {
                        throw new Error(["Property:", propertyName, "is not of type:", typeName].join(' '));
                    }
                }
            }

            return this;
        },

        /**
         * Promises a property definition (read-only).
         * @param object {object} Host object.
         * @param propertyName {string} Property name.
         * @param generator {function} Generates (and returns) property value.
         */
        promise: function (object, propertyName, generator) {
            // checking whether property is already defined
            if (object.hasOwnProperty(propertyName)) {
                self._warn("Property '" + propertyName + "' already exists.");
                return;
            }

            // rounding up rest of the arguments
            var generatorArguments = [object, propertyName].concat(Array.prototype.slice.call(arguments, 3));

            // placing class promise on namespace as getter
            Object.defineProperty(object, propertyName, {
                get: function () {
                    // obtaining property value
                    var value = generator.apply(this, generatorArguments);

                    if (typeof value !== 'undefined') {
                        // generator returned a property value
                        // overwriting promise with actual property value
                        Object.defineProperty(object, propertyName, {
                            value: value,
                            writable: false,
                            enumerable: true,
                            configurable: false
                        });
                        return value;
                    } else {
                        // no return value
                        // generator supposedly assigned value to property
                        return object[propertyName];
                    }
                },
                set: function (value) {
                    // overwriting promise with property value
                    Object.defineProperty(object, propertyName, {
                        value: value,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                },
                enumerable: true,
                configurable: true  // must be configurable in order to be re-defined
            });
        },

        /**
         * Determines target of property addition.
         * In testing mode, each class has two prototype levels and
         * methods should go to the lower one, so they may be covered on
         * the other.
         */
        getTarget: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @this {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (methods) {
            self.add.call(
                self.getTarget.call(this),
                methods,
                false, true, false,
                undefined,
                'function'
            );
            return this;
        },

        /**
         * Adds private read-only methods to class.
         * @this {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addPrivateMethod: function (methods) {
            self.add.call(
                self.getTarget.call(this),
                methods,
                false, false, false,
                troop.privatePrefix,
                'function'
            );
            return this;
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public writable members to class or instance.
         * @this {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPublic: function (properties) {
            return self.add.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (properties) {
            return self.add.call(this, properties, true, false, false, troop.privatePrefix);
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (properties) {
            return self.add.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addPrivateConstant: function (properties) {
            return self.add.call(this, properties, false, false, false, troop.privatePrefix);
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.base} Instance or class object.
         * @param methods {object} Mock methods.
         */
        addMock: function (methods) {
            return self.add.call(
                this,
                methods,
                false, true, true,
                undefined,
                'function'
            );
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

    self.add.call(troop, {
        promise: self.promise
    }, false, true, false);
}());
