/**
 * Instantiation Feature
 */
/*global dessert, troop */
troop.Base.addMethod(/** @lends troop.Base */{
    /**
     * Creates instance of a class.
     * Class must implement an .init method
     * which decorates the instance with necessary properties.
     * @return {troop.Base} Instance.
     * @example
     * var instance = someClass.create(someArgs);
     */
    create: function () {
        // instantiating class or surrogate
        var self = troop.Surrogate.getSurrogate.apply(this, arguments) || this,
            that = troop.Base.extend.call(self),
            result;

        // initializing instance properties
        if (typeof self.init === 'function') {
            // running instance initializer
            result = self.init.apply(that, arguments);

            if (typeof result === 'undefined') {
                // initializer returned nothing, returning new instance
                return that;
            } else if (result !== self && self.isPrototypeOf(result)) {
                // initializer returned a (different) instance of this class
                return result;
            } else {
                // initializer returned something else
                dessert.assert(false, "Unrecognizable value returned by .init().", result);
            }
        } else {
            dessert.assert(false, "Class implements no .init() method.");
        }

        return result;
    }
});
