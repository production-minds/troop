/**
 * General purpose OOP functionality: class extension, instantiation, property delegation.
 */
var troop = troop || {};

(function ($properties, $feature) {
    $properties.addConstant.call(troop, {
        /**
         * Whether Troop is in testing mode
         */
        testing: false,

        /**
         * Whether methods should be writable
         */
        writable: !$feature.canAssignToReadOnly()
    });
}(
    troop.properties,
    troop.feature
));
