#!/bin/bash

yarn install
yarn test
yarn build "$@"

cp -r assets dist/
mv dist/assets/robots.txt dist/
mv dist/assets/favicon.ico dist/
tar -cJf file.tar.xz -C dist/ .

echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add - > /dev/null
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cp "$SSH_KNOWN_HOSTS" ~/.ssh/known_hosts
chmod 644 ~/.ssh/known_hosts
