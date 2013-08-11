/**
 * Base Class.
 *
 * Most basic features required to build rest of the library
 * are implemented here. Rest of its methods are implemented
 * and applied by each feature separately.
 */
/*global dessert, troop */
(function () {
    "use strict";

    // custom assertion for troop classes
    dessert.addTypes(/** @lends dessert */{
        /**
         * Checks whether properties of `expr` are *all* functions.
         * @param {object} expr
         * @returns {Boolean}
         */
        isAllFunctions: function (expr) {
            var methodNames,
                i;

            if (!this.isObject(expr)) {
                return false;
            }

            methodNames = Object.keys(expr);
            for (i = 0; i < methodNames.length; i++) {
                if (!this.isFunctionOptional(expr[methodNames[i]])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Verifies if `expr` is a Troop class.
         * @param {troop.Base} expr
         * @returns {Boolean}
         */
        isClass: function (expr) {
            return self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Troop class or is not defined.
         * @param {troop.Base} expr
         * @returns {Boolean}
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   self.isPrototypeOf(expr);
        }
    });

    /**
     * @class troop.Base
     */
    troop.Base = {
        /**
         * Disposable method for adding further (public) methods.
         * Will be replaced by Properties.
         * @param {object} methods Object of methods.
         * @ignore
         */
        addMethods: function (methods) {
            dessert.isAllFunctions(methods, "Some methods are not functions.");

            var methodNames = Object.keys(methods),
                i, methodName;
            for (i = 0; i < methodNames.length; i++) {
                methodName = methodNames[i];
                Object.defineProperty(this, methodName, {
                    value       : methods[methodName],
                    enumerable  : true,
                    writable    : false,
                    configurable: false
                });
            }

            return this;
        }
    };

    var self = troop.Base;

    self.addMethods(/** @lends troop.Base */{
        /**
         * Extends class. Extended classes may override base class methods and properties according to
         * regular OOP principles.
         * @example
         * var MyClass = troop.Base.extend();
         * @returns {troop.Base}
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
         * Determines target object of method addition.
         * In testing mode, each class has two prototype levels and methods should go to the lower one
         * so they may be covered on the other. Do not use in production, only testing.
         * @returns {troop.Base}
         */
        getTarget: function () {
            return /** @type {troop.Base} */ troop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        /**
         * Retrieves the base class of the current class.
         * @example
         * var MyClass = troop.Base.extend();
         * MyClass.getBase() === troop.Base; // true
         * @returns {troop.Base}
         */
        getBase: function () {
            return /** @type {troop.Base} */ troop.testing === true ?
                Object.getPrototypeOf(Object.getPrototypeOf(this)) :
                Object.getPrototypeOf(this);
        },

        /**
         * Tests whether the current class or instance is a descendant of base.
         * @example
         * var MyClass = troop.Base.extend();
         * MyClass.isA(troop.Base) // true
         * MyClass.isA(MyClass) // false
         * @param {troop.Base} base
         * @returns {boolean}
         */
        isA: function (base) {
            return base.isPrototypeOf(this);
        },

        /**
         * Tests whether the current class is base of the provided object.
         * @function
         * @example
         * var MyClass = troop.Base.extend();
         * MyClass.isA(troop.Base) // true
         * MyClass.isA(MyClass) // false
         * @returns {boolean}
         */
        isBaseOf: Object.prototype.isPrototypeOf,

        /**
         * Tests whether the current class or instance is the direct extension or instance
         * of the specified class.
         * @param {troop.Base} base
         * @example
         * var ClassA = troop.Base.extend(),
         *     ClassB = ClassA.extend();
         * ClassA.instanceOf(troop.Base) // true
         * ClassB.instanceOf(troop.Base) // false
         * ClassB.instanceOf(ClassA) // true
         * @returns {Boolean}
         */
        instanceOf: function (base) {
            return self.getBase.call(this) === base;
        }
    });
}());
