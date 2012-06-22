/**
 * Inheritance & instantiation tools.
 */
/*global troop */
(function ($properties) {
    troop.inheritance = {
        /**
         * Extends base class with methods.
         * Extended class will have methods as read-only own properties.
         * @this {troop.base} Base class.
         * @param [methods] {object} Object containing methods {public, read-only}.
         * @return {object}
         */
        extend: function (methods) {
            var result = Object.create(this);

            /**
             * Extending once more with no own properties
             * so that methods may be mocked on a static level.
             */
            if (troop.testing === true) {
                result = Object.create(result);
            }

            if (methods) {
                $properties.addMethod.call(result, methods);
            }

            $properties.add.call(result, {
                base: this
            }, false, false, false);

            return result;
        },

        /**
         * Creates an instance of a class, ie. creates a new object and adds writable
         * properties to it.
         * @this {troop.base} Class to instantiate.
         * @param [properties] {object} Object containing properties (public, writable)
         * @return {object}
         */
        instantiate: function (properties) {
            var result = Object.create(this);

            if (properties) {
                $properties.addPublic.call(result, properties);
            }

            return result;
        }
    };
}(
    troop.properties
));
