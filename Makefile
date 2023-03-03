.DEFAULT_GOAL := build
.PHONY: build install backend frontend package patch minor major

FULL_IMAGE_TAG := $(shell git describe --tags --always)

build: frontend backend package

install:
	yarn install
	go get -u github.com/grafana/grafana-plugin-sdk-go
	go mod tidy

backend:
	mage -v

frontend:
	yarn build

package:
	export FULL_IMAGE_TAG=$(git describe --tags --always)
	mv dist/ washed-edgedb-datasource
	zip washed-edgedb-datasource-$(FULL_IMAGE_TAG).zip washed-edgedb-datasource -r
	mv washed-edgedb-datasource/ dist

patch:
	npm version patch

minor:
	npm version minor

major:
	npm version major
