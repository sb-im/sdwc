# SDWC == S Dashboard Web Console

[![ci](https://github.com/sb-im/sdwc/actions/workflows/ci.yml/badge.svg)](https://github.com/sb-im/sdwc/actions/workflows/ci.yml)

Robotics Cluster Cloud Console

## Introduction

> The Application developed by the sbim inno (StrawBerry Tech)
> MPL-2.0 protocol open source, the goal is to do a universal robotics console application

## Build Setup

``` bash
# install dependencies
yarn install

# build for production with minification
yarn run build
```

## Install && Config

```bash
cp src/config.json ./
```

## Development

```bash
# docker or nerdctl
docker compose up
# serve with hot reload at localhost:8080
yarn run dev
```

## CHANGELOG

[doc/CHANGELOG.md](/doc/CHANGELOG.md)

## Development Docs

[doc/DEVELOPMENT.md](/doc/DEVELOPMENT.md)
