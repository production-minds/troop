/**
 * Surrogate Class Feature
 */
/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class troop.Surrogate
     * @ignore
     */
    troop.Surrogate = {
        /**
         * Adds surrogates buffer to class.
         * @this {troop.Base}
         */
        initSurrogates: function () {
            this.addConstants(/** @lends troop.Base */{
                /**
                 * Container for surrogate info. Added to class via .initSurrogates().
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
         * @this {troop.Base}
         * @returns {troop.Base}
         */
        getSurrogate: function () {
            var args = arguments,
                preparationHandler,
                descriptors,
                i, descriptor,
                result;

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
                    result = descriptor.filter.apply(this, args);
                    if (result) {
                        // when descriptor has className: positive response activates that class
                        // when descriptor is ambiguous: response is either a class name or class definition
                        if (result === true && hOP.call(descriptor, 'className')) {
                            return descriptor.namespace[descriptor.className];
                        } else if (typeof result === 'string') {
                            return descriptor.namespace[result];
                        } else if (troop.Base.isPrototypeOf(result)) {
                            return result;
                        }
                        dessert.assert(false, "Invalid return type from surrogate filter:", typeof result);
                    }
                }
            }

            // returning caller as fallback
            return this;
        }
    };

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Adds a handler to be called before evaluating any of the surrogate filters.
         * The specified handler receives the original constructor arguments and is expected to
         * return a modified argument list (array) that will be passed to the surrogate filters.
         * @param {function} handler
         * @returns {troop.Base}
         * @see troop.Base#addSurrogate
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
         * Adds a surrogate class to the current class. Instantiation is forwarded to the first surrogate where
         * the filter returns true.
         * @param {object} namespace Namespace in which the surrogate class resides.
         * @param {string} className Surrogate class name. The class the namespace / class name point to does not
         *        Has to exist (or be resolved when postponed) at the time of adding the filter.
         * @param {function} filter Function evaluating whether the surrogate class specified by the namespace
         * and class name fits the arguments.
         * @example
         * var ns = {}; // namespace
         * ns.Horse = troop.Base.extend()
         *     .prepareSurrogates(function (height) {
         *         return [height < 5]; // isPony
         *     })
         *     .addSurrogate(ns, 'Pony', function (isPony) {
         *         return isPony;
         *     })
         *     .addMethods({ init: function () {} });
         * ns.Pony = ns.Horse.extend()
         *     .addMethods({ init: function () {} });
         * var myHorse = ns.Horse.create(10), // instance of ns.Horse
         *     myPony = ns.Horse.create(3); // instance of ns.Pony
         * @see troop.Base#addSurrogates
         * @returns {troop.Base}
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
        },

        /**
         * Adds one or more surrogate classes to the current class. Instantiation is forwarded to the
         * class (name or definition) returned from the filter. Return falsey to fall through.
         *
         * @param {object} namespace
         *        Namespace in which the surrogate classes reside.
         *        Has to exist (or be resolved when postponed) at the time of adding the filter.
         * @param {function} filter
         *        Function evaluating whether the surrogate class specified by the namespace
         *        and class name fits the arguments.
         * @example
         * var ns = {}; // namespace
         * ns.Vehicle = troop.Base.extend()
         *     .addSurrogate(ns, function (type) {
         *         switch (type) {
         *         case 'truck':
         *         case 'sedan':
         *             return 'FourWheeler';
         *         case 'bike':
         *             return 'TwoWheeler';
         *         default:
         *             return false;
         *         }
         *     })
         *     .addMethods(…);
         * var myTruck = ns.Vehicle.create('truck'), // instance of ns.FourWheeler
         *     myBike = ns.Vehicle.create('bike'),   // instance of ns.TwoWheeler
         *     myBoat = ns.Vehicle.create('boat');   // instance of ns.Vehicle
         * @see troop.Base#addSurrogate
         * @returns {troop.Base}
         */
        addSurrogates: function (namespace, filter) {
            dessert
                .isObject(namespace, "Invalid namespace object")
                .isFunction(filter, "Invalid filter function");

            if (!hOP.call(this, 'surrogateInfo')) {
                troop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.descriptors.push({
                namespace: namespace,
                filter   : filter
            });

            return this;
        }
    });
}());
