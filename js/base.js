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
            var self = $inheritance.instantiate.call(this);

            // initializing instance properties
            if (typeof this.init === 'function') {
                this.init.apply(self, arguments);
            } else {
                throw "Class doesn't implement .init method.";
            }

            return self;
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
