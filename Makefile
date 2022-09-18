.DEFAULT_GOAL := all

install:
	yarn install
	go get -u github.com/grafana/grafana-plugin-sdk-go
	go mod tidy

backend:
	mage -v

frontend:
	yarn build

all: frontend backend
