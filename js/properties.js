/**
 * Property Management.
 *
 * Adding properties of different purposes to a class or instance.
 */
var troop = troop || {};

(function () {
    troop.properties = {
        /**
         * Adds properties to object with the specified attributes.
         * @param o {object}
         * @param properties {object}
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         * @param [prefix] {string} Property prefix. Added to all assigned properties.
         */
        add: function (o, properties, isWritable, isEnumerable, isConfigurable, prefix) {
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
                    Object.defineProperty(o, prefixed, {
                        value: properties[name],
                        writable: !!isWritable,
                        enumerable: !!isEnumerable,
                        configurable: !!isConfigurable
                    });
                }
            }
            return o;
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @param c {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (c, methods) {
            return this.add(c, methods, false, true, false);
        },

        /**
         * Adds static members to class.
         * Static = read-only, enumerable
         * @param c {troop.base} Class object.
         * @param properties {object} Properties and methods.
         */
        addStatic: function (c, properties) {
            return this.add(c, properties, false, true, false);
        },

        //////////////////////////////
        // Instance-level

        /**
         * Adds public writable members to class or instance.
         * @param o {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPublic: function (o, properties) {
            return this.add(o, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @param c {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (o, properties) {
            return this.add(o, properties, true, false, false, 'p_');
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @param o {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (o, properties) {
            return this.add(o, properties, false, true, false);
        }
    };

    troop.properties.addMethod(troop, troop.properties);
}());
