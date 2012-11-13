
Tests
=====

Running the tests needs:

 * [phantomjs](http://phantomjs.org)
 * Python
 * [jslint](http://www.jslint.com) (optional)
 
Note that jslint is most easily installed with [npm](http://npmjs.org/).

Before the suite is run, start a server:

  > ./serve.sh&

Release Testing
---------------

Phantom only tests a specific build of WebKit; releases need to be tested
on:

 * IE 6+
 * Safari 5+
 * FireFox (current)
 * Chrome (current)
 * Opera (current)