/*global dessert, troop */
troop.postpone(troop, 'Documented', function () {
    "use strict";

    var self = troop.Base.extend();

    /**
     * Documented trait. Adds meta information to the class, including class name, namespace, and instance ID.
     * @class
     * @extends troop.Base
     */
    troop.Documented = self
        .addPublic(/** @lends troop.Documented */{
            /**
             * Next instance ID.
             * @type {number}
             */
            nextInstanceId: 0
        })
        .addMethods(/** @lends troop.Documented */{
            /**
             * Extends class adding meta information.
             * @param {string} className Class name
             * @returns {troop.Documented}
             */
            extend: function (className) {
                var base = this.getBase(),
                    result = base.extend.call(this);

                result.addConstants(/** @lends troop.Documented */{
                    /**
                     * @type {string}
                     */
                    className: className
                });

                return result;
            },

            /**
             * @ignore
             */
            init: function () {
                /**
                 * Instance ID.
                 * @type {number}
                 * @memberOf troop.Documented#
                 */
                this.instanceId = self.nextInstanceId++;
            }
        });
});
