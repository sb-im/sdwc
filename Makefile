# Project image repo.
IMAGE?=ghcr.io/sb-im/sdwc:latest

.PHONY: image
image:
	@docker build -t $(IMAGE) .

.PHONY: push
push:
	@docker push $(IMAGE)

.PHONY: run
run:
	@docker run \
	-d \
	--rm \
	--name sdwc \
	-p 8080:80 \
	$(IMAGE)

.PHONY: stop
stop:
	@docker stop sdwc

dist.tar.gz:
	@docker cp sdwc:/usr/share/nginx/html dist
	@tar -zcvf dist.tar.gz dist

.PHONY: clean
clean:
	@rm -rf dist dist.tar.gz
