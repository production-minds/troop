/**
 * Inheritance unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function ($inheritance) {
    module("Inheritance");

    test("Class extension", function () {
        function testFunction() {
            return 'hello';
        }

        var myClass = $inheritance.extend.call(Object.prototype, {
            foo: testFunction,
            bar: "bar"
        });

        equal(myClass.foo, testFunction, "Method applied to extended object");
        equal(myClass.hasOwnProperty('foo'), true, "foo is own property");
        equal(myClass.bar, "bar", "Property applied to extended object");
        equal(myClass.hasOwnProperty('bar'), true, "bar is own property");
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
    troop.inheritance
));
