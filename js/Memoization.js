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

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Assigns instance key calculator to
         * @param {function} instanceMapper Instance key mapper function
         * @return {troop.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            dessert
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            /**
             * Maps constructor arguments to instance keys in the registry.
             * @type {function}
             * @return {string}
             */
            this.instanceMapper = instanceMapper;

            /**
             * Lookup registry for instances of the memoized class.
             * Has to be own property as child classes may put their instances here, too.
             * @type {object}
             */
            this.instanceRegistry = {};

            return this;
        },

        /**
         * Tells whether the current class (or any of its parents) is memoized
         * @return {boolean}
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        },

        /**
         * Clears instance registry and therefore frees memory.
         * (Unless instances are still referenced from other objects & scopes.)
         */
        clearInstanceRegistry: function () {
            dessert.assert(hOP.call(this, 'instanceRegistry'), "Class doesn't own an instance registry");
            this.instanceRegistry = {};
            return this;
        }
    });
}());
