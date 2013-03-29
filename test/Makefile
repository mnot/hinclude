test_port=8081
test: basic none lint

basic: server
	phantomjs basic.js $(test_port)

none: server
	phantomjs none.js $(test_port)

lint: 
	node ../node_modules/jslint/bin/jslint.js ../hinclude.js

server:
	./serve.sh $(test_port)
