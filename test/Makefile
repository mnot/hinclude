
test_port=8081
test: basic none

basic: server
	phantomjs basic.js $(test_port)

none: server
	phantomjs none.js $(test_port)

lint:
	jslint --terse ../hinclude.js

server:
	./serve.sh $(test_port)
