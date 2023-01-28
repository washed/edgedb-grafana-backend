.DEFAULT_GOAL := build
.PHONY: build install backend frontend package

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
	mv dist/ washed-edgedbgb-datasource
	zip washed-edgedbgb-datasource-$(FULL_IMAGE_TAG).zip washed-edgedbgb-datasource -r
	mv washed-edgedbgb-datasource/ dist
