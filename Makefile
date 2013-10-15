
test: lint test-only

test-only:
	@./node_modules/.bin/mocha -R spec

tolint := *.js *.json lib

lint:
	@jshint --verbose $(tolint)

.PHONY: test lint
