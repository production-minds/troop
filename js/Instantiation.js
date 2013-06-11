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
         * Creates instance of a class.
         * Class must implement an .init method
         * which decorates the instance with necessary properties.
         * @return {troop.Base} Instance.
         * @example
         * var instance = someClass.create(someArgs);
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
            var self = this.surrogates ?
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
