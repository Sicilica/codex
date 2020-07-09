.PHONY: build
build:
	npx tsc

.PHONY: lint
lint:
	npx eslint src

.PHONY: lint-fix
lint-fix:
	npx eslint src --fix

.PHONY: setup
setup:
	npm ci

.PHONY: test
test:
	npx ts-mocha src/tests/**/*.ts

.PHONY: watch
watch:
	npx tsc -w
