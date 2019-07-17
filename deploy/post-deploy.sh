#!/bin/bash

VERSION=$1
export VUE_APP_VERSION=$VERSION
source /srv/openstore/env.sh

set -x
set -e

cd /srv/openstore-web/$VERSION
# TODO use a cached node_modules
npm install
npm install --only=dev
npm run build

rm -f /srv/openstore-web/current
ln -s /srv/openstore-web/$VERSION /srv/openstore-web/current

cd /srv/openstore-web/
echo "Going to remove old versions"
ls -1t | grep -v current | tail -n +10
ls -1t | grep -v current | tail -n +10 | xargs -d '\n' -r rm -r --
