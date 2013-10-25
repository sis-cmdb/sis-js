# Makefile for the browser tests

webroot:
	npm install
	rm -rf webroot
	mkdir -p webroot/lib/test
	cp node_modules/mocha/mocha.js webroot/lib
	cp node_modules/mocha/mocha.css webroot/lib
	cp node_modules/expect.js/expect.js webroot/lib
	cp test/data/*.js webroot/lib/test
	cp test/test-config.js webroot/lib/test
	cp test/test-util.js webroot/lib/test
	cp lib/sis-js.js webroot/lib
	cp test/index.html webroot/

clean:
	rm -rf webroot
	rm -rf node_modules
