/**
 * Utilities
 *
 * Static class.
 */
/*globals dessert, troop */
(function () {
    var self = troop.Utils = troop.Base.extend()
        .addConstant({
            /**
             * Shortcut to global scope.
             * `window` in the browser, `global` in Node.js
             * @type {window|global}
             */
            global: this,
        })
        .addMethod({
            /**
             * Resolves a path on the global scope.
             * It's basically an oversimplified flock.get.
             * @param path {string[]}
             * @param [context] {object}
             * @private
             * @static
             */
            resolve: function (path, context) {
                var result = context || self.global;
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
            extractHostInfo: function (/* host / hostPath / fullPath, [propertyName] */) {
                var fullPath, // full path to target object
                    hostPath, //
                    host, // host object (containing the target object)
                    propertyName, // name of target in host object
                    tmp,
                    rest; // rest of arguments returned by method

                if (typeof arguments[0] === 'string') {
                    // first argument is path to either the host object or property
                    if (typeof arguments[1] === 'string') {
                        // first arg path to host, second name of property
                        hostPath = arguments[0];
                        fullPath = hostPath + '.' + arguments[1];
                        host = self.resolve(arguments[0].split('.'));
                        propertyName = arguments[1];
                        rest = Array.prototype.slice.call(arguments, 2);
                    } else {
                        // first arg full path
                        fullPath = arguments[0];
                        tmp = fullPath.split('.');
                        propertyName = tmp.pop();
                        hostPath = tmp.join('.');
                        host = self.resolve(tmp);
                        rest = Array.prototype.slice.call(arguments, 1);
                    }
                } else if (typeof arguments[0] === 'object') {
                    // first argument is host object
                    host = arguments[0];
                    propertyName = arguments[1];
                    rest = Array.prototype.slice.call(arguments, 2);
                } else {
                    rest = arguments;
                }

                dessert
                    .isStringOptional(fullPath)
                    .isObject(host)
                    .isString(propertyName);

                return {
                    fullPath    : fullPath,
                    host        : host,
                    propertyName: propertyName,
                    arguments   : rest
                };
            }
        });
}());
