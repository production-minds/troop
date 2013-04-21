/**
 * Surrogate Class Feature
 */
/*global dessert, troop */
(function () {
    "use strict";

    /**
     * @class troop.Surrogate
     */
    troop.Surrogate = {
        /**
         * Retrieves first surrogate fitting constructor arguments.
         * @this {troop.Base} Class
         * @return {troop.Base|undefined}
         */
        getSurrogate: function () {
            var surrogates,
                i, surrogateInfo;

            /**
             * Surrogates property must be the class' own property
             * otherwise surrogates would be checked on instantiating
             * every descendant of the current class, too.
             * This would be wasteful, unnecessary, and confusing.
             */
            if (this.hasOwnProperty('surrogates')) {
                surrogates = this.surrogates;
                for (i = 0; i < surrogates.length; i++) {
                    surrogateInfo = surrogates[i];

                    // determining whether arguments fit next filter
                    if (surrogateInfo.filter.apply(this, arguments)) {
                        return surrogateInfo.namespace[surrogateInfo.className];
                    }
                }
            }
        }
    };

    troop.Base.addMethod(/** @lends troop.Base */{
        /**
         * Adds surrogate class to this class.
         * When surrogate classes are present, instantiation is delegated
         * to the first surrogate satisfying the filter argument.
         * params: namespace, className, filter
         * @this {troop.Base} Class object.
         */
        addSurrogate: function (namespace, className, filter) {
            if (!this.hasOwnProperty('surrogates')) {
                this.addConstant({surrogates: []});
            }

            dessert
                .isObject(namespace, "Invalid namespace object")
                .isString(className, "Invalid class name")
                .isFunction(filter, "Invalid filter function");

            this.surrogates.push({
                namespace: namespace,
                className: className,
                filter   : filter
            });

            return this;
        }
    });
}());