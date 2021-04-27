# Project image repo.
IMAGE?=ghcr.io/sb-im/sdwc:latest

.PHONY: image
image:
	@docker build -t $(IMAGE) .

.PHONY: push
push:
	@docker push $(IMAGE)
