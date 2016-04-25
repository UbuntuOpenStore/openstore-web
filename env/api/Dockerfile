FROM node:5.11
MAINTAINER Brian Douglass

ENV HOST=http://local.open.uappexplorer.com

RUN apt-get install -y libstdc++6
RUN npm install supervisor gulp -g

EXPOSE 8080
WORKDIR /srv/openstore
CMD ["npm", "run", "dev"]
