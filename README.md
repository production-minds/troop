Troop
=====

True JavaScript OOP. Fast & transparent.

Troop provides *base class* and a set of *tools* to build a close approximation of true classes in ECMAScript 5. Troop puts emphasis on:

- instantiation performance at multiple inheritance
- code transparency & reflection: no more duck typing

The price to pay for all this is there are no real privates in Troop. Pseudo-privates are supported, which are accessible from the outside, but not enumerable.

Library is based on a post series at [Code Pristine](http://codepristine.com), demonstrating the advantages of the OOP model implemented by Troop.

Base class
----------

Class `troop.base` offers the following methods:

- `.extend(methods)`: Extends class optionally with supplied methods.
- `.create(...)`: Creates an instance of the class. Calls user-defined `.init` method internally. Arguments are passed over to `.init`. Inside `.init`, `this` refers to the current instance.
- `.addMethod`, `.addPrivateMethod`, `.addConstant`, `.addPublic`, `.addPrivate`, `.addPrivateConstant`: Adds non-removable properties and methods to class or instance.
  - Methods and constants are read-only.
  - Public and private variables are writable.
  - All except privates are enumerable.
- `.addMock` and `.removeMocks`: Simple mock method application. Mock methods are removable and are meant to be used in testing mode.

Testing aid
-----------

Troop assists the application of mock methods to classes and objects in unit tests. To make use of this feature, one must first turn on testing mode by issuing `troop.testing = true;` in the global scope (immediately after loading Troop).

Then, existing methods may be overridden like this: `myClass.addMock({foo: function () {}})`. Until removed, mock methods will be invoked instead of the original methods. Mocks are removed by issuing `.removeMocks()` on the class or instance being affected, e.g. `myClass.removeMocks()`.

Example
-------

The following example implements and instantiates a class with (pseudo-)private & public members, read-only methods and constants.

```javascript
var myClass = troop.base.extend()
    .addPrivate({
        secret: "ufo"
    }).addPublic({
        hello: "world"
    }).addConstant({
        pi: 3.14
    }).addMethod({
        init: function (place) {
            this.addPublic({
                hello: place
            });
        }
    });

var myInstance = myClass.create("Yonkers");
```

![myInstance in console](http://dl.dropbox.com/u/9258903/myInstance.png)

See the [Troop wiki](https://github.com/production-minds/troop/wiki) for further details.
