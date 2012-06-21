/**
 * Feature detection.
 */
/*global troop */
(function ($properties) {
    var $feature = troop.feature = {
        /**
         * Determines whether read-only properties may be
         * covered up by assignment.
         * @return {boolean}
         */
        canAssignToReadOnly: function () {
            var
            // creating base object with read-only property
                base = Object.defineProperty({}, 'p', {
                    value: false
                }),
            // deriving object
                child = Object.create(base);

            // attempting to change read-only property on base
            child.p = true;

            // determining whether change was successful
            return child.p === true;
        }
    };

    // environmental constants
    $properties.addConstant.call(troop, {
        /**
         * Whether methods should be writable
         */
        writable: !$feature.canAssignToReadOnly()
    });

    // application state (alterable by user)
    $properties.addPublic.call(troop, {
        /**
         * Whether Troop is in testing mode
         */
        testing: false
    });
}(
    troop.properties
));
