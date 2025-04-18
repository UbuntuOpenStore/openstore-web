#!/bin/bash

export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

VERSION=$1
ENV=${2:-""}
BASE=/srv/openstore-web$ENV

export VUE_APP_VERSION=$VERSION$ENV
source /srv/openstore$ENV/env.sh

set -x
set -e

cd $BASE/$VERSION
# TODO use a cached node_modules
npm install --production=false

npm run build$ENV

rm -f $BASE/current
ln -s $BASE/$VERSION $BASE/current

cd $BASE/
echo "Going to remove old versions"
ls -1t | grep -v current | tail -n +10
ls -1t | grep -v current | tail -n +10 | xargs -d '\n' -r rm -r --
