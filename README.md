Troop
=====

True OOP. Fast & transparent.

Troop provides *base class* and a set of *tools* to build a close approximation of true classes in ECMAScript 3/5. Troop puts emphasis on:

- instantiation performance at multiple inheritance
- code transparency & reflection: no more duck typing

The price to pay for all this is there are no real privates in Troop. Pseudo-privates are supported, which are accessible from the outside, but not enumerable.

The library is based on a series of posts at [Code Pristine](http://codepristine.com), demonstrating the advantages of the OOP model implemented by Troop.

Troop requires assertion library "[dessert](https://github.com/danstocker/dessert)". Version requirements are specified in `js/troop.js`.

Example
-------

The following example defines and instantiates a class with (pseudo-)private & public members, read-only methods and constants.

```javascript
var myClass = troop.Base.extend()
    .addPrivate({
        _secret: "ufo"
    })
    .addPublic({
        hello: "world"
    })
    .addConstant({
        pi: 3.14
    })
    .addMethod({
        init: function (place) {
            this.addPublic({
                hello: place
            });
        }
    });

var myInstance = myClass.create("Yonkers");
```

![myInstance in console](https://dl.dropbox.com/u/9258903/myInstance-0.2.2.png)

Also, check out these jsFiddles:

- [Using Troop](http://jsfiddle.net/danstocker/n5jze/)
- [Using Troop promises](http://jsfiddle.net/danstocker/YR374/)
- [Surrogate classes in Troop](http://jsfiddle.net/danstocker/ZsZGy/)

See the [Troop wiki](https://github.com/production-minds/troop/wiki) for further details.
