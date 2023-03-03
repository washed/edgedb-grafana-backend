.DEFAULT_GOAL := build
.PHONY: build install backend frontend package patch minor major playground playground-update playground-copy

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

playground: playground-copy
	docker-compose -f playground/docker-compose.yaml up --build --remove-orphans

playground-update: build
	docker-compose -f playground/docker-compose.yaml stop grafana
	make playground-copy
	docker-compose -f playground/docker-compose.yaml start grafana

playground-copy:
	cp -r dist/ playground/grafana/plugins/washed-edgedb-datasource/
