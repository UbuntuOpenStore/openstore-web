#!/bin/bash

# Based on https://github.com/Polyconseil/vue-gettext/blob/master/Makefile

NODE_BINDIR=./node_modules/.bin
export PATH=$NODE_BINDIR:$PATH

INPUT_FILES=./src
POT_FILE=po/openstore.pot

GETTEXT_HTML_SOURCES=$(find $INPUT_FILES -name '*.vue' -o -name '*.html' 2> /dev/null)
GETTEXT_JS_SOURCES=$(find $INPUT_FILES -name '*.vue' -o -name '*.js')
echo $GETTEXT_JS_SOURCES

which gettext-extract
# Extract gettext strings from templates files and create a POT dictionary template.
gettext-extract --attribute v-translate --quiet --output $POT_FILE $GETTEXT_HTML_SOURCES

xgettext --language=JavaScript --keyword=npgettext:1c,2,3 \
    --from-code=utf-8 --join-existing --no-wrap \
    --package-name=$(node -e "console.log(require('./package.json').name);") \
    --package-version=$(node -e "console.log(require('./package.json').version);") \
    --output $POT_FILE $GETTEXT_JS_SOURCES

# Clean up the extra spaces in the pot file
sed -i 's/    //g' $POT_FILE
