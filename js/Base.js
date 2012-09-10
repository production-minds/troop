/**
 * Base Class.
 *
 * Supports extension, instantiation, property addition.
 * All base methods are non-enumerable.
 */
/*global troop */
(function (Inheritance, Properties) {
    var self = troop.Base = Object.create(Object.prototype);

    // adding instantiation mechanism
    Properties.add.call(self, {
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
            var self = Inheritance.instantiate.call(this),
                result;

            // initializing instance properties
            if (typeof this.init === 'function') {
                // running instance initializer
                result = this.init.apply(self, arguments);

                if (typeof result === 'undefined') {
                    // initializer returned nothing, returning new instance
                    return self;
                } else if (Properties.getBase.call(result) === this) {
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
    Properties.add.call(self, {
        addConstant: Properties.addConstant,
        addMethod: Properties.addMethod,
        addPrivate: Properties.addPrivate,
        addPrivateConstant: Properties.addPrivateConstant,
        addPrivateMethod: Properties.addPrivateMethod,
        addPublic: Properties.addPublic,
        addTrait: Properties.addTrait,
        addMock: Properties.addMock,
        removeMocks: Properties.removeMocks,
        getBase: Properties.getBase
    }, false, false, false);

    // adding inheritance features
    Properties.add.call(self, {
        extend: Inheritance.extend
    }, false, false, false);
}(
    troop.Inheritance,
    troop.Properties
));
