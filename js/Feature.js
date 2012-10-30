/**
 * Feature detection.
 */
/*global troop */
(function () {
    var self = troop.Feature = {
        /**
         * Determines whether read-only properties may be
         * covered up by assignment.
         * @return {boolean}
         */
        canAssignToReadOnly: function () {
            var base, child;

            // creating base object with read-only property
            base = Object.defineProperty({}, 'p', {
                writable: false,
                value: false
            });

            // deriving object
            child = Object.create(base);

            // attempting to change read-only property on base
            child.p = true;

            // determining whether change was successful
            return child.p === true;
        },

        /**
         * Determines whether defineProperty is ES5 or polyfill.
         */
        hasPropertyAttributes: function () {
            // creating object with read-only property
            var o = Object.defineProperty({}, 'p', {
                writable: false,
                value: false
            });

            // attempting to change property
            o.p = true;

            // when property can be changed, defineProperty is sure to be polyfill
            return !o.p;
        }
    };

    /**
     * Whether methods should be writable (environmental)
     */
    troop.writable = !self.canAssignToReadOnly();

    /**
     * Whether Troop is in testing mode (application state)
     */
    troop.testing = false;
}());
