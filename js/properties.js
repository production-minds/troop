/**
 * Property Management.
 *
 * Adding properties of different purposes to a class or instance.
 */
/*global troop */
(function () {
    var PRIVATE_PREFIX = 'p_',
        $properties;

    $properties = troop.properties = {
        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param properties {object}
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @param [prefix] {string} Property prefix. Added to all assigned properties.
         */
        add: function (properties, isWritable, isEnumerable, isConfigurable, prefix) {
            var name, prefixed;
            for (name in properties) {
                if (properties.hasOwnProperty(name)) {
                    if (!prefix || name.substr(0, prefix.length) === prefix) {
                        // property name is already prefixed
                        prefixed = name;
                    } else {
                        // adding prefix
                        prefixed = prefix + name;
                    }
                    Object.defineProperty(this, prefixed, {
                        value: properties[name],
                        writable: !!isWritable,
                        enumerable: !!isEnumerable,
                        configurable: !!isConfigurable
                    });
                }
            }
            return this;
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @this {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (methods) {
            return $properties.add.call(this, methods, false, true, false);
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
            return $properties.add.call(this, properties, true, false, false, PRIVATE_PREFIX);
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
            return $properties.add.call(this, properties, false, false, false, PRIVATE_PREFIX);
        }
    };
}());
