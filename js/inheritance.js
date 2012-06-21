/**
 * General purpose OOP functionality: class extension, instantiation, property delegation.
 */
var troop = troop || {};

(function () {
    troop.inheritance = {
        /**
         * Extends base class with methods.
         * Extended class will have methods as read-only own properties.
         * @param base {object} Base class.
         * @param [methods] {object} Object containing methods {public, read-only}.
         * @return {object}
         */
        extend: function (base, methods) {
            var c = Object.create(base),
                result = methods ?
                    troop.properties.addMethod(c, methods) :
                    c;

            /**
             * Extending once more with no own properties
             * so that methods may be mocked on a static level.
             */
            if (troop.testing === true) {
                result = Object.create(result);
            }

            return result;
        },

        /**
         * Creates an instance of a class, ie. creates a new object and adds writable
         * properties to it.
         * @param base {object} Base class.
         * @param [properties] {object} Object containing properties (public, writable)
         * @return {object}
         */
        instantiate: function (base, properties) {
            var o = Object.create(base),
                result = properties ?
                    troop.addPublic(o, properties) :
                    o;

            return result;
        }
    };

    troop.addStatic(troop, troop.inheritance);

    troop.addStatic(troop, {
        /**
         * Whether OOP is in testing mode
         */
        testing: false,

        /**
         * Whether methods should be writable
         */
        writable: !troop.feature.canAssignToReadOnly()
    });
}());
