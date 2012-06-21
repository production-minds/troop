/**
 * General purpose OOP functionality: class extension, instantiation, property delegation.
 */
var troop = troop || {};

(function () {
    troop.base = troop.extend(Object.prototype, {
        /**
         * Creates a class instance.
         * The derived class must implement an .init method
         * which decorates the instance with necessary properties.
         * @static
         * @this {wraith.base} Class.
         * @return {wraith.base} Instance.
         * @example
         * var instance = someClass.create(someArgs);
         */
        create: function () {
            // instantiating class
            var self = troop.instantiate(this);

            // initializing instance properties
            if (typeof this.init === 'function') {
                this.init.apply(self, arguments);
            } else {
                throw "Class doesn't implement .init method.";
            }

            return self;
        }
    });
}());
