Troop
=====

*Full-featured, testable OOP*

[Wiki](https://github.com/production-minds/troop/wiki)

[Reference](http://production-minds.github.io/troop/)

Troop features
--------------

- classic OO structures like classes, instances, traits
- taking full advantage of ES5 property attributes
    - pseudo-privates that are non-enumerable
    - constants are actually read-only
- testing mode for applying mock methods
- postponed, on-demand property definitions
- delegation of instantiation with surrogates
- support for instance memoization

Troop is distinguished from other OOP-related libs such as MooTools or Backbone by

- not littering *your* classes and instances with its own meta-properties
- non-declarative API leads to better IDE integration
- offering simpler unit testing with built-in mocks to speed up TDD process

Example
-------

    var MyClass = troop.Base.extend()
        .addPrivate({
            _secret: "ufo" // static private property
        })
        .addPublic({
            hello: "world" // static public property
        })
        .addConstants({
            pi: 3.14 // static public constant
        })
        .addMethods({
            init: function (who) {
                this.addPublic({
                    hello: who
                });
            }
        });

    var myInstance = MyClass.create("all");

![myInstance in console](https://dl.dropboxusercontent.com/u/9258903/myInstance-0.4.0.png)

Check out these jsFiddles for more examples:

- [Using Troop](http://jsfiddle.net/danstocker/n5jze/)
- [Postponed property definitions](http://jsfiddle.net/danstocker/YR374/)
- [Surrogate classes in Troop](http://jsfiddle.net/danstocker/ZsZGy/)

See the [Troop wiki](https://github.com/production-minds/troop/wiki) for further details.
