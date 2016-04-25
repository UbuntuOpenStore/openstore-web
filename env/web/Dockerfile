FROM node:5.11
MAINTAINER Brian Douglass

RUN npm install -g webpack webpack-dev-server

EXPOSE 8081
WORKDIR /srv/openstore
CMD ["npm", "run", "webpack-dev"]
