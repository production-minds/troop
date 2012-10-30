echo Usage: build.sh [version]

if [ $# -eq 0 ]
then
    VERSION="latest"
else
    VERSION=$1
fi

NAME="troop-$VERSION"
NAMEMIN="troop-$VERSION-min"

if [ ! -d build ]
then
    mkdir build
fi

for f in "build/$NAME"*
do
    if [ -e $f ]
    then
        echo Removing "$f".
        rm $f
    fi
done

cat \
js/license.js \
js/troop.js \
js/Polyfill.js \
js/Properties.js \
js/Promise.js \
js/Feature.js \
js/Inheritance.js \
js/Base.js \
js/exports.js \
> "build/$NAME.js"

if type yui-compressor >/dev/null 2>&1
then
    echo Minifying using YUI compressor.
    yui-compressor "build/$NAME.js" > build/tmp.js
elif type jsmin >/dev/null 2>&1
then
    echo Minifying using Jsmin.
    jsmin < "build/$NAME.js" > build/tmp.js
else
    echo No minifier found, skipping minification.
fi

if [ -f build/tmp.js ]
then
    cat js/license.js build/tmp.js > "build/$NAMEMIN.js"
    rm build/tmp.js

    echo Gzipping.
    gzip --stdout "build/$NAMEMIN.js" > "build/$NAMEMIN.js.gz"
fi

echo Done.
