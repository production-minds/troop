/**
 * Inheritance & instantiation tools.
 */
/*global troop */
(function (Utils) {
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
             * Adds surrogate class to this class.
             * When surrogate classes are present, instantiation is delegated
             * to the first surrogate satisfying the filter argument.
             * @this {troop.Base} Class object.
             */
            addSurrogate: function (/* namespace, className, filter */) {
                if (!this.hasOwnProperty('surrogates')) {
                    this.addConstant({surrogates: []});
                }

                var hostInfo = Utils.extractHostInfo.apply(this, arguments),
                    namespace = hostInfo.host, // namespace for surrogate class
                    className = hostInfo.propertyName, // name of surrogate class
                    args = hostInfo.arguments, // rest of arguments
                    filter = args[0]; // filter function

                this.surrogates.push({
                    namespace: namespace,
                    className: className,
                    filter   : filter
                });

                return this;
            },

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
                var surrogates, i, surrogateInfo, surrogate,
                    that,
                    result;

                // checking surrogates
                if (this.hasOwnProperty('surrogates')) {
                    surrogates = this.surrogates;
                    for (i = 0; i < surrogates.length; i++) {
                        surrogateInfo = surrogates[i];
                        if (surrogateInfo.filter.apply(this, arguments)) {
                            // surrogate fits arguments
                            surrogate = surrogateInfo.namespace[surrogateInfo.className];
                            if (this !== surrogate) {
                                // current class is not surrogate of base class(es)
                                // instantiating surrogate class
                                return surrogate.create.apply(surrogate, arguments);
                            }
                        }
                    }
                }

                // instantiating class
                that = self._instantiate.call(this);

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
        addSurrogate: self.addSurrogate,
        create      : self.create,
        isA         : self.isA,
        instanceOf  : self.isA
    });

    return self;
}(troop.Utils));
