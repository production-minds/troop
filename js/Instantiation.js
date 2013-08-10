/**
 * Instantiation Feature
 */
/*global dessert, troop */
(function () {
    "use strict";

    var Memoization = troop.Memoization,
        Surrogate = troop.Surrogate,
        Base = troop.Base;

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Creates a new instance of the class it was called on. Arguments passed to .create will be handed over
         * to the user-defined .init method, which will decorate the new instance with properties.
         * Class must implement .init method in order to be instantiable.
         * Instantiation might return an existing instance of the same class if the class is memoized.
         * @see troop.Base.setInstanceMapper
         * Instantiation might create a new instance of a subclass if the current class has surrogates.
         * @see troop.Base.addSurrogate
         * @example
         * var MyClass = troop.extend({
         *         init: function (foo) {
         *            this.foo = 'bar';
         *         }
         *     }),
         *     myInstance = MyClass.create("bar");
         * myInstance.foo // "bar"
         * @return {troop.Base}
         */
        create: function () {
            var isMemoized = this.instanceMapper,
                instanceKey,
                result;

            // attempting to fetch memoized instance
            if (isMemoized) {
                instanceKey = Memoization.mapInstance.apply(this, arguments);
                result = Memoization.getInstance.call(this, instanceKey);
                if (result) {
                    return result;
                }
            }

            // instantiating class or surrogate
            var self = this.surrogateInfo ?
                    Surrogate.getSurrogate.apply(this, arguments) :
                    this,
                that = Base.extend.call(self);

            // initializing instance properties
            if (typeof self.init === 'function') {
                // running instance initializer
                result = self.init.apply(that, arguments);

                if (typeof result === 'undefined') {
                    // initializer returned nothing, returning new instance
                    result = that;
                } else if (!(result !== self && self.isPrototypeOf(result))) {
                    // initializer did not return a valid instance
                    // (instance of the same or derived class)
                    dessert.assert(false, "Unrecognizable value returned by .init().", result);
                }
            } else {
                dessert.assert(false, "Class implements no .init() method.");
            }

            // storing instance for memoized class
            if (isMemoized) {
                Memoization.addInstance.call(self, instanceKey, result);
            }

            return result;
        }
    });
}());
