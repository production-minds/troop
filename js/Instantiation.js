/**
 * Instantiation Feature
 */
/*global dessert, troop */
(function (Base, Surrogate) {
    var self = troop.Instantiation = Base.extend()
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
                var that,
                    result;

                // instantiating class or surrogate
                that = Base.extend.call(Surrogate.getSurrogate.apply(this, arguments) || this);

                // initializing instance properties
                if (typeof this.init === 'function') {
                    // running instance initializer
                    result = this.init.apply(that, arguments);

                    if (typeof result === 'undefined') {
                        // initializer returned nothing, returning new instance
                        return that;
                    } else if (result !== this && this.isPrototypeOf(result)) {
                        // initializer returned a (different) instance of this class
                        return result;
                    } else {
                        // initializer returned something else
                        dessert.assert(false, "Unrecognizable value returned by .init().", result);
                    }
                } else {
                    dessert.assert(false, "Class implements no .init() method.");
                }
            }
        });

    // delegating public methods to troop.Base
    Base.addMethod({
        create: self.create
    });
}(troop.Base, troop.Surrogate));
