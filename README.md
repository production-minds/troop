Troop
=====

True JavaScript OOP. Fast & transparent.

Troop provides *base class* and a set of *tools* to build a close approximation of true classes in ECMAScript 5. Troop puts emphasis on:

- instantiation performance at multiple inheritance
- code transparency & reflection: no more duck typing

The price to pay for all this is there are no real privates in Troop. Pseudo-privates are supported, which are accessible from the outside, but not enumerable.

Base class
----------

Class `troop.base` offers the following methods:

- `.extend(methods)`: Extends class optionally with supplied methods.
- `.create(...)`: Creates an instance of the class. Calls user-defined `.init` method internally.
- `.addMethod`, `.addConstant`, `.addPublic`, `.addPrivate`: Adds non-removable properties and methods to class or instance.
  - Methods and constants are read-only.
  - Public and private variables are writable.
  - All except privates are enumerable.

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

Based on post series on [Code Pristine](http://codepristine.com)
