/**
 * Surrogate Class Feature
 */
/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class troop.Surrogate
     */
    troop.Surrogate = {
        /**
         * Adds surrogates buffer to class.
         */
        initSurrogates: function () {
            this.addConstants(/** @lends troop.Base */{
                /**
                 * Container for surrogate info
                 * @type {object}
                 */
                surrogateInfo: {
                    /**
                     * @type {function}
                     */
                    preparationHandler: undefined,

                    /**
                     * @type {object[]}
                     */
                    descriptors: []
                }
            });
        },

        /**
         * Retrieves first surrogate fitting constructor arguments.
         * @this {troop.Base} Class
         * @returns {troop.Base}
         */
        getSurrogate: function () {
            var args = arguments,
                preparationHandler,
                descriptors,
                i, descriptor;

            /**
             * Surrogate info property must be the class' own property
             * otherwise surrogates would be checked on instantiating
             * every descendant of the current class, too.
             * This would be wasteful, unnecessary, and confusing.
             */
            if (hOP.call(this, 'surrogateInfo')) {
                // dealing with preparation handler
                preparationHandler = this.surrogateInfo.preparationHandler;
                if (preparationHandler) {
                    args = preparationHandler.apply(this, arguments) || arguments;
                }

                // going through descriptors and determining surrogate
                descriptors = this.surrogateInfo.descriptors;
                for (i = 0; i < descriptors.length; i++) {
                    descriptor = descriptors[i];

                    // determining whether arguments fit next filter
                    if (descriptor.filter.apply(this, args)) {
                        return descriptor.namespace[descriptor.className];
                    }
                }
            }

            // returning caller as fallback
            return this;
        }
    };

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Adds a handler to be called before evaluating any surrogates.
         * Handler is expected to return a value that is passed to all
         * surrogate filters.
         * @param {function} handler
         */
        prepareSurrogates: function (handler) {
            dessert.isFunction(handler, "Invalid handler");

            if (!hOP.call(this, 'surrogateInfo')) {
                troop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.preparationHandler = handler;

            return this;
        },

        /**
         * Adds surrogate class to this class.
         * When surrogate classes are present, instantiation is delegated
         * to the first surrogate satisfying the filter argument.
         * @param {object} namespace
         * @param {string} className
         * @param {function} filter
         * @this {troop.Base} Class object.
         */
        addSurrogate: function (namespace, className, filter) {
            dessert
                .isObject(namespace, "Invalid namespace object")
                .isString(className, "Invalid class name")
                .isFunction(filter, "Invalid filter function");

            if (!hOP.call(this, 'surrogateInfo')) {
                troop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.descriptors.push({
                namespace: namespace,
                className: className,
                filter   : filter
            });

            return this;
        }
    });
}());
