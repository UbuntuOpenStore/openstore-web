FROM node:5.11
MAINTAINER Brian Douglass

RUN npm install -g webpack@2.2.0 webpack-dev-server@2.2.0

EXPOSE 8081
WORKDIR /srv/openstore
CMD ["npm", "run", "webpack-dev"]
