/**
 * Promise Addition.
 *
 * API to add properties to objects as promises.
 * A promise means that the property will be evaluated upon first access.
 */
/*global troop, console */
(function () {
    var self = troop.Promise = troop.Base.extend()
        .addConstant({
            //////////////////////////////
            // Constants

            /**
             * Shortcut to global scope.
             * `window` in the browser, `global` in Node.js
             * @type {window|global}
             */
            global: this,

            /**
             * Registry of unfulfilled promises.
             */
            unfulfilled: {}
        })
        .addPrivateMethod({
            //////////////////////////////
            // Utilities

            /**
             * Resolves a path on the global scope.
             * It's basically an oversimplified flock.get.
             * @param path {string[]}
             * @private
             * @static
             */
            _resolve: function (path) {
                var result = self.global;
                while (path.length) {
                    result = result[path.shift()];
                    if (typeof result === 'undefined') {
                        break;
                    }
                }
                return result;
            },

            /**
             * Normalizes promise arguments, so that the output is the same
             * for all possible combinations.
             * @return {Object} Normalized argument list.
             * @private
             * @static
             */
            _normalizeArguments: function () {
                var path,
                    host, tmp,
                    propertyName,
                    generator;

                if (typeof arguments[0] === 'string') {
                    // first argument is path to either the host object or property
                    if (typeof arguments[1] === 'string') {
                        // first arg path to host, second name of property
                        path = arguments[0] + '.' + arguments[1];
                        host = self._resolve(arguments[0].split('.'));
                        propertyName = arguments[1];
                        generator = arguments[2];
                    } else {
                        // first arg full path
                        path = arguments[0];
                        tmp = path.split('.');
                        propertyName = tmp.pop();
                        host = self._resolve(tmp);
                        generator = arguments[1];
                    }
                } else if (typeof arguments[0] === 'object') {
                    // first argument is host object
                    host = arguments[0];
                    propertyName = arguments[1];
                    generator = arguments[2];
                }

                return {
                    path: path,
                    host: host,
                    propertyName: propertyName,
                    generator: generator
                };
            }
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
                var args = self._normalizeArguments.apply(this, arguments),
                    path = args.path,
                    generatorArguments;

                // applying normalized arguments
                host = args.host;
                propertyName = args.propertyName;
                generator = args.generator;

                if (path) {
                    // adding promise to registry
                    self.unfulfilled[path] = true;
                }

                // checking whether property is already defined
                if (host.hasOwnProperty(propertyName)) {
                    return;
                }

                // rounding up rest of the arguments
                generatorArguments = [host, propertyName].concat(Array.prototype.slice.call(arguments, 3));

                // placing class promise on namespace as getter
                Object.defineProperty(host, propertyName, {
                    get: function () {
                        // obtaining property value
                        var value = generator.apply(this, generatorArguments);

                        if (typeof value !== 'undefined') {
                            // generator returned a property value
                            // overwriting promise with actual property value
                            Object.defineProperty(host, propertyName, {
                                value: value,
                                writable: false,
                                enumerable: true,
                                configurable: false
                            });
                        } else {
                            // no return value
                            // generator supposedly assigned value to property
                            value = host[propertyName];
                        }

                        if (path) {
                            // removing promise form registry
                            delete self.unfulfilled[path];
                        }

                        return value;
                    },

                    set: function (value) {
                        // overwriting promise with property value
                        Object.defineProperty(host, propertyName, {
                            value: value,
                            writable: false,
                            enumerable: true,
                            configurable: false
                        });
                    },

                    enumerable: true,
                    configurable: true  // must be configurable in order to be re-defined
                });
            }
        });

    troop.unfulfilled = self.unfulfilled;
    troop.promise = self.promise;
}());
