(function (Utils) {
    module("Utils");

    test("Scope", function () {
        equal(Utils.global, window, "Global scope in the browser");
    });

    test("Scope resolution", function () {
        window.hello = {world: "bar"};
        equal(Utils.resolve(['hello', 'world']), "bar", "Resolving existing object");
        equal(typeof Utils.resolve(['hi', 'world']), 'undefined', "Resolving non-existing object");
    });

    test("Promise argument processing", function () {
        var testFunc = function () {};

        window.bar = {
            path: {}
        };

        deepEqual(
            Utils.extractHostInfo('bar.path.prop', testFunc),
            {
                fullPath        : 'bar.path.prop',
                host        : window.bar.path,
                propertyName: 'prop',
                arguments   : [testFunc]
            },
            "Promise args with full path"
        );

        deepEqual(
            Utils.extractHostInfo('bar.path', 'prop', testFunc),
            {
                fullPath        : 'bar.path.prop',
                host        : window.bar.path,
                propertyName: 'prop',
                arguments   : [testFunc]
            },
            "Promise args with host path & property name"
        );

        deepEqual(
            Utils.extractHostInfo(window.bar.path, 'prop', testFunc),
            {
                fullPath        : undefined,
                host        : window.bar.path,
                propertyName: 'prop',
                arguments   : [testFunc]
            },
            "Promise args with host object & property name"
        );
    });
}(troop.Utils));
