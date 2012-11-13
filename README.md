# hinclude.js

Tired of regenerating HTML pages from templates? Want more from Web caches?
*HInclude* makes one thing very easy; including other bits of HTML into your
Web page, _using the browser_.

HInclude is declarative client-side inclusion for the Web; it allows easy
composition of Web pages using the browser -- making your pages more modular,
more cacheable, and easier to maintain. 

You can run javascript code after loading 'hx:include' inserting the
javascript code inside the tag

	<script> ... </script>

example..

	<hx:include src="new">
  	//...//
  	<script>$('#sample').css('color': 'red');</script>
	</hx:include>

		
in the particular case where the content has the JavaScript code that is 
executed before 'hinclude' finish on its own, for example widget

See [the demo page](http://mnot.github.com/hinclude/) for documentation and
examples.

in the particular case where the content has the JavaScript code that is executed before 'hinclude' finish on its own, for example widget
