.PHONY: build
build:
	npx tsc

.PHONY: test
test:
	npx ts-mocha src/tests/**/*.ts

.PHONY: watch
watch:
	npx tsc -w
