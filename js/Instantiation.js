/**
 * Inheritance & instantiation tools.
 */
/*global dessert, troop */
(function (Utils) {
    var self = troop.Instantiation = troop.Base.extend()
        .addPrivateMethod({
            /**
             * Creates an instance of a class, ie. creates a new object and adds writable
             * properties to it.
             * @this {troop.Base} Class
             * @return {object}
             * @private
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
            },

            /**
             * Retrieves first surrogate fitting constructor arguments.
             * @this {troop.Base} Class
             * @return {troop.Base}
             * @private
             */
            _getSurrogate: function () {
                var surrogates = this.surrogates,
                    i, surrogateInfo;

                if (typeof surrogates !== 'undefined') {
                    for (i = 0; i < surrogates.length; i++) {
                        surrogateInfo = surrogates[i];

                        // determining whether arguments fit next filter
                        if (surrogateInfo.filter.apply(this, arguments)) {
                            return surrogateInfo.namespace[surrogateInfo.className];
                        }
                    }
                }
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

                dessert.isFunction(filter);

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
                var that,
                    result;

                // instantiating class or surrogate
                that = self._instantiate.call(self._getSurrogate.call(this) || this);

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
                        dessert.assert(false, "Unrecognizable value returned by .init.");
                    }
                } else {
                    dessert.assert(false, "Class implements no .init method.");
                }
            },

            /**
             * Tests whether the current object is a descendant of base.
             * @param base {troop.Base}
             */
            isA: function (base) {
                return base.isPrototypeOf(this);
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
