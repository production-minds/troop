/**
 * Base Class.
 *
 * Most basic features required to build rest of the library
 * are implemented here. Rest of its methods are implemented
 * and applied by each feature separately.
 */
/*global dessert, troop */
(function () {
    var self;

    // custom assertion for troop classes
    dessert.addTypes(/** @lends dessert */{
        /**
         * Checks whether properties of `expr` are *all* functions.
         * @param {object} expr
         * @return {Boolean}
         */
        isAllFunctions: function (expr) {
            var methodName;

            if (!this.isObject(expr)) {
                return false;
            }

            for (methodName in expr) {
                if (expr.hasOwnProperty(methodName) && !this.isFunctionOptional(expr[methodName])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifies if `expr` is a Troop class.
         * @param {troop.Base} expr
         * @return {Boolean}
         */
        isClass: function (expr) {
            return self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Troop class or is not defined.
         * @param {troop.Base} expr
         * @return {Boolean}
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    /**
     * @class troop.Base
     */
    troop.Base = self = {
        /**
         * Disposable method for adding further (public) methods.
         * Will be replaced by Properties.
         * @param {object} methods Object of methods.
         */
        addMethod: function (methods) {
            dessert.isAllFunctions(methods, "Some methods are not functions.");

            var methodName;
            for (methodName in methods) {
                if (methods.hasOwnProperty(methodName)) {
                    Object.defineProperty(this, methodName, {
                        value       : methods[methodName],
                        enumerable  : true,
                        writable    : false,
                        configurable: false
                    });
                }
            }

            return this;
        }
    };

    self.addMethod(/** @lends troop.Base */{
        /**
         * Extends base class with methods.
         * Extended class will have methods as read-only own properties.
         * @function
         * @this {troop.Base} Troop class.
         * @return {troop.Base}
         */
        extend: function () {
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
         * Determines target of property addition.
         * In testing mode, each class has two prototype levels and
         * methods should go to the lower one, so they may be covered on
         * the other.
         * @function
         * @return {troop.Base}
         */
        getTarget: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the immediate base class of a given child class.
         * @function
         * @return {troop.Base}
         */
        getBase: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        /**
         * Tests whether the current object is a descendant of base.
         * @param {troop.Base} base
         */
        isA: function (base) {
            return base.isPrototypeOf(this);
        },

        /**
         * Tests whether the current class is base of the provided object.
         * @function
         */
        isBaseOf: Object.prototype.isPrototypeOf,

        /**
         * Tests whether the current object is the immediate descendant of base.
         * @param {troop.Base} base
         * @return {Boolean}
         */
        instanceOf: function (base) {
            return self.getBase.call(this) === base;
        }
    });
}());
