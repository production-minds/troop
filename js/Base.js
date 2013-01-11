/**
 * Base Class.
 *
 * Supports extension, instantiation, property addition.
 * All base methods are non-enumerable.
 */
/*global dessert, troop */
(function () {
    var self = troop.Base = {
        /**
         * Disposable method that adds further methods.
         * @param methods {object} Object of methods.
         */
        addMethod: function (methods) {
            dessert.isPlainObject(methods);

            var methodName, method;

            for (methodName in methods) {
                if (methods.hasOwnProperty(methodName)) {
                    method = methods[methodName];
                    dessert.isFunction(method);

                    Object.defineProperty(this, methodName, {
                        value       : method,
                        enumerable  : true,
                        writable    : false,
                        configurable: false
                    });
                }
            }

            return this;
        }
    };

    self.addMethod({
        /**
         * Extends base class with methods.
         * Extended class will have methods as read-only own properties.
         * @function
         * @this {troop.Base} Troop class.
         * @return {object}
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
    });

    // custom assertion for troop classes
    dessert.addTypes({
        /**
         * Verifies if `expr` is a Troop class.
         * @param expr {troop.Base}
         * @return {Boolean}
         */
        isClass: function (expr) {
            return expr instanceof Object && self.isPrototypeOf(expr);
        },

        /**
         * Verifies if `expr` is a Troop class or is not defined.
         * @param expr {troop.Base}
         * @return {Boolean}
         */
        isClassOptional: function (expr) {
            return typeof expr === 'undefined' ||
                   expr instanceof Object && self.isPrototypeOf(expr);
        }
    });

    return self;
}());
