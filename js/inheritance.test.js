/**
 * Inheritance unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function ($inheritance, $properties) {
    module("Inheritance");

    test("Class extension", function () {
        function testFunction() {
            return 'hello';
        }

        var myClass = $inheritance.extend.call(Object.prototype, {
            foo: testFunction
        });

        equal(myClass.foo, testFunction, "Method applied to extended object");
        equal(myClass.hasOwnProperty('foo'), true, "foo is own property");
    });

    test("Extension while in test mode", function () {
        troop.testing = true;

        var myClass = $inheritance.extend.call(Object.prototype, {
                method: function () {}
            }),
            result;

        equal(typeof myClass.method, 'function', "Method applied to extended object");
        equal(myClass.hasOwnProperty('method'), false, "Method is not own property");

        result = $properties.addMethod.call(myClass, {
            foo: function () {}
        });

        equal(result, myClass, "addMethod returns input object");
        equal(typeof myClass.foo, 'function', "Method applied to extended object");
        equal(myClass.hasOwnProperty('foo'), false, "Method is not own property");

        troop.testing = false;
    });

    test("Instantiation", function () {
        var myClass = $inheritance.instantiate.call(Object.prototype, {
            bar: "bar"
        });

        equal(myClass.bar, "bar", "Property applied to extended object");
        equal(myClass.hasOwnProperty('bar'), true, "bar is own property");

        myClass.bar = ''; // attempting to overwrite method
        equal(myClass.bar, "", "Property is writable");
    });
}(
    troop.inheritance,
    troop.properties
));
