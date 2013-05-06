/**
 * Surrogate Class Feature
 */
/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class troop.Memoization
     */
    troop.Memoization = {
        /**
         * Adds instance to registry. Must be called on class object!
         * @this {troop.Base} Troop-based class
         * @param {string} key Instance key
         * @param {troop.Base} instance Instance to be memoized
         */
        addInstance: function (key, instance) {
            // checking instance registry
            // doesn't have to be own property, may be on parent class
            if (!(this.instanceRegistry instanceof Object)) {
                this.addConstant(/** @lends troop.Base */{
                    /**
                     * Lookup registry for instances of the memoized class
                     * @type {object}
                     */
                    instanceRegistry: {}
                });
            }

            this.instanceRegistry[key] = instance;
        },

        /**
         * Fetches a memoized instance from the registry.
         * @param {string} key
         * @return {troop.Base}
         */
        getInstance: function (key) {
            var instanceRegistry = this.instanceRegistry;
            return instanceRegistry ? instanceRegistry[key] : undefined;
        },

        /**
         * Maps instance to registry
         * Receives constructor arguments
         * @return {string} Instance key
         */
        mapInstance: function () {
            return this.instanceMapper.apply(this, arguments);
        }
    };

    troop.Base.addMethod(/** @lends troop.Base */{
        /**
         * Assigns instance key calculator to
         * @param {function} instanceMapper Instance key mapper function
         * @return {troop.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            dessert
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            // adding memoization-related properties to class
            this.addConstant(/** @lends troop.Base */{
                /**
                 * Maps constructor arguments to instance keys in the registry.
                 * @type {function}
                 * @return {string}
                 */
                instanceMapper: instanceMapper
            });

            return this;
        },

        /**
         * Tells whether the current class (or any of its parents) is memoized
         * @return {boolean}
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        }
    });
}());
