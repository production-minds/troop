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
         * @returns {troop.Base}
         */
        getInstance: function (key) {
            var instanceRegistry = this.instanceRegistry;
            return instanceRegistry ? instanceRegistry[key] : undefined;
        },

        /**
         * Maps instance to registry
         * Receives constructor arguments
         * @returns {string} Instance key
         */
        mapInstance: function () {
            return this.instanceMapper.apply(this, arguments);
        }
    };

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Assigns instance key calculator to class. Makes class memoized.
         * @param {function} instanceMapper Instance key mapper function.
         * @example
         * var MyClass = troop.Base.extend()
         *     .setInstanceMapper(function (arg) {return '' + arg;})
         *     .addMethods({
         *         init: function () {}
         *     }),
         *     myInstance1 = MyClass.create('foo'),
         *     myInstance2 = MyClass.create('foo');
         * MyClass.isMemoized() // true
         * myInstance 1 === myInstance2 // true
         * @returns {troop.Base}
         */
        setInstanceMapper: function (instanceMapper) {
            dessert
                .isFunction(instanceMapper, "Invalid instance key calculator")
                .assert(!hOP.call(this, 'instanceMapper'), "Instance mapper already set");

            /**
             * Maps constructor arguments to instance keys in the registry.
             * @type {function}
             * @returns {string}
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
         * Tells whether the current class (or any of its base classes) is memoized.
         * @returns {boolean}
         * @see troop.Base.setInstanceMapper
         */
        isMemoized: function () {
            return typeof this.instanceMapper === 'function';
        },

        /**
         * Clears instance registry. After the registry is cleared, a new set of instances will be created
         * for distinct constructor arguments.
         * @returns {troop.Base}
         * @see troop.Base.setInstanceMapper
         */
        clearInstanceRegistry: function () {
            dessert.assert(hOP.call(this, 'instanceRegistry'), "Class doesn't own an instance registry");
            this.instanceRegistry = {};
            return this;
        }
    });
}());
