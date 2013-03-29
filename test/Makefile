
test_port=8081
test: advanced basic none

advanced: server
	phantomjs advanced.js $(test_port)

basic: server
	phantomjs basic.js $(test_port)

none: server
	phantomjs none.js $(test_port)

lint:
	jslint --terse ../hinclude.js

server:
	./serve.sh $(test_port)
