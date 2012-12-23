/**
 * Inheritance & instantiation tools.
 */
/*global troop */
(function () {
    var self = troop.Instantiation = troop.Base.extend()
        .addPrivateMethod({
            /**
             * Creates an instance of a class, ie. creates a new object and adds writable
             * properties to it.
             * @this {troop.Base} Class to instantiate.
             * @return {object}
             */
            _instantiate: function () {
                var result = Object.create(this);

                /**
                 * Extending once more with no own properties
                 * so that methods may be mocked on a static level.
                 */
                if (troop.testing === true) {
                    result = Object.create(result);
                }

                return result;
            }
        })
        .addMethod({
            /**
             * Creates a class instance.
             * The derived class must implement an .init method
             * which decorates the instance with necessary properties.
             * @static
             * @this {troop.Base} Class.
             * @return {troop.Base} Instance.
             * @example
             * var instance = someClass.create(someArgs);
             */
            create: function () {
                // instantiating class
                var that = self._instantiate.call(this),
                    result;

                // initializing instance properties
                if (typeof this.init === 'function') {
                    // running instance initializer
                    result = this.init.apply(that, arguments);

                    if (typeof result === 'undefined') {
                        // initializer returned nothing, returning new instance
                        return that;
                    } else if (result !== this && result instanceof this.constructor) {
                        // initializer returned a (different) instance of this class
                        return result;
                    } else {
                        // initializer returned something else
                        throw new TypeError("Unrecognizable value returned by .init.");
                    }
                } else {
                    throw new Error("Class implements no .init method.");
                }
            },

            /**
             * Tests whether the current object is a descendant of base.
             * @param base {troop.Base}
             */
            isA: function (base) {
                return this instanceof base.constructor;
            }
        });

    // delegating public methods to troop.Base
    troop.Base.addMethod({
        create: self.create,
        isA: self.isA,
        instanceOf: self.isA
    });

    return self;
}());
