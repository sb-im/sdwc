#!/bin/bash
set -ev

yarn install
yarn test
yarn build "$@"

tar -cJf file.tar.xz -C dist/ .
