/**
 * Promise Addition.
 *
 * API to add properties to objects as promises.
 * A promise means that the property will be evaluated upon first access.
 */
/*global dessert, troop, console */
(function (Base, Utils) {
    var self = troop.Promise = Base.extend()
        .addMethod({
            //////////////////////////////
            // Control

            /**
             * Promises a property definition (read-only).
             * @param host {object} Host object.
             * @param propertyName {string} Property name.
             * @param generator {function} Generates (and returns) property value.
             */
            promise: function (host, propertyName, generator) {
                var sliceArguments = Array.prototype.slice.bind(arguments),
                    generatorArguments;

                dessert
                    .isPlainObject(host, "Host is not a direct descendant of Object.prototype.")
                    .isString(propertyName, "Invalid property name")
                    .isFunction(generator, "Invalid generator function");

                // checking whether property is already defined
                if (host.hasOwnProperty(propertyName)) {
                    return;
                }

                // rounding up rest of the arguments
                generatorArguments = sliceArguments(0, 2).concat(sliceArguments(3));

                // placing class promise on namespace as getter
                Object.defineProperty(host, propertyName, {
                    get: function () {
                        // obtaining property value
                        var value = generator.apply(this, generatorArguments);

                        if (typeof value !== 'undefined') {
                            // generator returned a property value
                            // overwriting promise with actual property value
                            Object.defineProperty(host, propertyName, {
                                value       : value,
                                writable    : false,
                                enumerable  : true,
                                configurable: false
                            });
                        } else {
                            // no return value
                            // generator supposedly assigned value to property
                            value = host[propertyName];
                        }

                        return value;
                    },

                    set: function (value) {
                        // overwriting promise with property value
                        Object.defineProperty(host, propertyName, {
                            value       : value,
                            writable    : false,
                            enumerable  : true,
                            configurable: false
                        });
                    },

                    enumerable  : true,
                    configurable: true  // must be configurable in order to be re-defined
                });
            }
        });

    Base.addMethod.call(troop, {
        promise: self.promise
    });
}(troop.Base, troop.utils));
