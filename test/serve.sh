#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cp -f $DIR/hinclude.js $DIR/test/assets/
cd $DIR/test/assets; python -m SimpleHTTPServer 8080 2>/dev/null