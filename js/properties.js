/**
 * Property Management.
 *
 * Adding properties of different purposes to a class or instance.
 */
/*global troop */
(function () {
    var $properties = troop.properties = {
        //////////////////////////////
        // Utilities

        /**
         * Adds properties to object using simple assignment.
         * @param properties {object}
         */
        _assign: function (object, propertyName, descriptor) {
            object[propertyName] = descriptor.value;
        },

        /**
         * Adds prefix to property name if it's not already there.
         * @param propertyName {string} Property name.
         * @param prefix {string} Prefix.
         * @return {string} Prefixed property name.
         */
        _addPrefix: function (propertyName, prefix) {
            if (!prefix || propertyName.substr(0, prefix.length) === prefix) {
                // property name is already prefixed
                return propertyName;
            } else {
                // adding prefix
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
                    $properties._assign :
                    Object.defineProperty,
                propertyName, property;

            for (propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    property = properties[propertyName];
                    if (!typeName || typeof property === typeName) {
                        addProperty(this, $properties._addPrefix(propertyName, prefix), {
                            value: property,
                            writable: isWritable,
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
            // placing class promise on namespace as getter
            Object.defineProperty(object, propertyName, {
                get: function () {
                    // obtaining property value
                    var value = generator(object, propertyName);

                    // overwriting promise with actual property value
                    Object.defineProperty(object, propertyName, {
                        value: value,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });

                    return value;
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
            $properties.add.call(
                $properties.getTarget.call(this),
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
            $properties.add.call(
                $properties.getTarget.call(this),
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
            return $properties.add.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (properties) {
            return $properties.add.call(this, properties, true, false, false, troop.privatePrefix);
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (properties) {
            return $properties.add.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addPrivateConstant: function (properties) {
            return $properties.add.call(this, properties, false, false, false, troop.privatePrefix);
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.base} Instance or class object.
         * @param methods {object} Mock methods.
         */
        addMock: function (methods) {
            return $properties.add.call(
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

    $properties.addPublic.call(troop, {
        /**
         * Prefix applied to names of private properties and methods.
         */
        privatePrefix: '_',

        /**
         * When true, plain assignment is used instead of property definition
         * when apply properties.
         */
        sloppy: false
    });

    $properties.add.call(troop, {
        promise: $properties.promise
    }, false, true, false);
}());
