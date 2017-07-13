FROM node:6.11
MAINTAINER Brian Douglass

ENV HOST=http://local.open.uappexplorer.com

RUN apt-get update
RUN apt-get install -y \
    libstdc++6 \
    binutils \
    python3-apt \
    python3-debian \
    python3-lxml \
    python3-magic \
    python3-simplejson \
    python3-xdg \
    python3-yaml \
    squashfs-tools
RUN npm install supervisor -g
RUN wget http://launchpadlibrarian.net/281607853/click-reviewers-tools_0.45_all.deb && \
    dpkg -i click-reviewers-tools_0.45_all.deb && \
    rm click-reviewers-tools_0.45_all.deb

EXPOSE 8080
WORKDIR /srv/openstore
CMD ["npm", "run", "dev"]
