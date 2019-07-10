#!/bin/bash
set -v

yarn install
yarn test
yarn build "$@"

cp -r assets dist/
mv dist/assets/robots.txt dist/
mv dist/assets/favicon.ico dist/
tar -cJf file.tar.xz -C dist/ .
