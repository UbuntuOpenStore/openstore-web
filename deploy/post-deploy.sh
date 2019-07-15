#!/bin/bash

VERSION=$1

set -x
set -e

export VUE_APP_VERSION=$VERSION
source /srv/openstore/env.sh

cd /srv/openstore-web/$VERSION
npm install
npm run build

rm -f /srv/openstore-web/current
ln -s /srv/openstore-web/$VERSION /srv/openstore-web/current

echo "Going to remove old versions"
ls -1t | grep -v current | tail -n +10
ls -1t | grep -v current | tail -n +10 | xargs -d '\n' -r rm -r --
