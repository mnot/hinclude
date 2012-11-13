#!/bin/sh

cp -f ../hinclude.js assets/
cd assets; python -m SimpleHTTPServer 8080 2>/dev/null