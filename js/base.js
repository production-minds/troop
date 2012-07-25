/**
 * Base Class.
 *
 * Supports extension, instantiation, property addition.
 * All base methods are non-enumerable.
 */
/*global troop */
(function ($inheritance, $properties) {
    var $base = troop.base = Object.create(Object.prototype);

    // adding instantiation mechanism
    $properties.add.call($base, {
        /**
         * Creates a class instance.
         * The derived class must implement an .init method
         * which decorates the instance with necessary properties.
         * @static
         * @this {troop.base} Class.
         * @return {troop.base} Instance.
         * @example
         * var instance = someClass.create(someArgs);
         */
        create: function () {
            // instantiating class
            var self = $inheritance.instantiate.call(this),
                result;

            // initializing instance properties
            if (typeof this.init === 'function') {
                // running instance initializer
                result = this.init.apply(self, arguments);

                if (typeof result === 'undefined') {
                    // initializer returned nothing, returning new instance
                    return self;
                } else if (Object.getPrototypeOf(result) === this) {
                    // initializer returned a (different) instance of this class
                    return result;
                } else {
                    // initializer returned something else
                    throw new TypeError("Unrecognizable value returned by .init.");
                }
            } else {
                throw new Error("Class implements no .init method.");
            }
        }
    });

    // adding property definition features
    $properties.add.call($base, {
        addConstant: $properties.addConstant,
        addMethod: $properties.addMethod,
        addPrivate: $properties.addPrivate,
        addPrivateConstant: $properties.addPrivateConstant,
        addPrivateMethod: $properties.addPrivateMethod,
        addPublic: $properties.addPublic,
        addTrait: $properties.addTrait,
        addMock: $properties.addMock,
        removeMocks: $properties.removeMocks
    }, false, false, false);

    // adding inheritance features
    $properties.add.call($base, {
        extend: $inheritance.extend
    }, false, false, false);
}(
    troop.inheritance,
    troop.properties
));
