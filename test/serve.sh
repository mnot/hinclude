#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cp -f $DIR/../hinclude.js $DIR/assets/
cd $DIR/assets; python -m SimpleHTTPServer 8080 2>/dev/null