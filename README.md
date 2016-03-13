# hinclude.js

<a href="http://travis-ci.org/mnot/hinclude"><img src="https://secure.travis-ci.org/mnot/hinclude.png?branch=master"></a>

Tired of regenerating HTML pages from templates? Want more from Web caches?
*HInclude* makes one thing very easy; including other bits of HTML into your
Web page, _using the browser_.

HInclude is declarative client-side inclusion for the Web; it allows easy
composition of Web pages using the browser -- making your pages more modular,
more cacheable, and easier to maintain. 

See [the demo page](http://mnot.github.com/hinclude/) for documentation and
examples.

## Dependencies

HInclude provides a custom element `<h-include>`. This means that you have
to use a polyfill for enabling [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/) for browsers not supporting it.

We recommend using [document-register-element](https://github.com/WebReflection/document-register-element) (3KB) as the polyfill for [W3C Custom Elements](http://w3c.github.io/webcomponents/spec/custom/).

Test.