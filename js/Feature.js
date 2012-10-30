/**
 * Feature detection.
 */
/*global troop */
(function (Properties) {
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

    // environmental constants
    Properties.addConstant.call(troop, {
        /**
         * Whether methods should be writable
         */
        writable: !self.canAssignToReadOnly()
    });

    // application state (alterable by user)
    Properties.addPublic.call(troop, {
        /**
         * Whether Troop is in testing mode
         */
        testing: false
    });
}(
    troop.Properties
));
