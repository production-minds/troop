/**
 * Promise Addition.
 *
 * API to add properties to objects as promises.
 * A promise means that the property will be evaluated upon first access.
 */
/*global dessert, troop, console */
(function (Base, Utils) {
    var self = troop.Promise = Base.extend()
        .addConstant({
            //////////////////////////////
            // Constants

            /**
             * Registry of unfulfilled promises.
             */
            unfulfilled: {}
        })
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
                var hostInfo = Utils.extractHostInfo.apply(Utils, arguments),
                    fullPath = hostInfo.fullPath,
                    generatorArguments;

                // applying normalized arguments
                host = hostInfo.host;
                propertyName = hostInfo.propertyName;
                generator = hostInfo.arguments.shift();

                dessert.isFunction(generator);

                if (fullPath) {
                    // adding promise to registry
                    self.unfulfilled[fullPath] = true;
                }

                // checking whether property is already defined
                if (host.hasOwnProperty(propertyName)) {
                    return;
                }

                // rounding up rest of the arguments
                generatorArguments = [host, propertyName].concat(hostInfo.arguments);

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

                        if (fullPath) {
                            // removing promise form registry
                            delete self.unfulfilled[fullPath];
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

    Base.addConstant.call(troop, {
        unfulfilled: self.unfulfilled
    });

    Base.addMethod.call(troop, {
        promise: self.promise
    });
}(troop.Base, troop.utils));
