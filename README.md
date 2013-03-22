Troop
=====

*Full-featured, testable OOP*

Troop is an OOP layer aiming to provide static structure for JavaScript applications.

Having a static structure leads to

- applications scaling better
- maintainable codebase

Troop features
--------------

- classic OO structures like classes, instances, traits
- taking full advantage of ES5 property attributes
    - pseudo-privates that are non-enumerable
    - constants are actually read-only
- testing mode for applying mock methods
- on-demand dependency resolution
- delegation of instantiation with surrogates

Troop is distinguished from other OOP-related libs such as MooTools or Backbone by

- not littering *your* classes and instances with its own meta-properties
- non-declarative API leads to better IDE integration
- offering simpler unit testing with built-in mocks to speed up TDD process

Example
-------

```javascript
var MyClass = troop.Base.extend()
    .addPrivate({
        _secret: "ufo" // static private property
    })
    .addPublic({
        hello: "world" // static public property
    })
    .addConstant({
        pi: 3.14 // static public constant
    })
    .addMethod({
        init: function (who) {
            this.addPublic({
                hello: who
            });
        }
    });

var myInstance = MyClass.create("all");
```

![myInstance in console](https://dl.dropbox.com/u/9258903/myInstance-0.3.0.png)

Check out these jsFiddles for more examples:

- [Using Troop](http://jsfiddle.net/danstocker/n5jze/)
- [Using Troop promises](http://jsfiddle.net/danstocker/YR374/)
- [Surrogate classes in Troop](http://jsfiddle.net/danstocker/ZsZGy/)

See the [Troop wiki](https://github.com/production-minds/troop/wiki) for further details.
