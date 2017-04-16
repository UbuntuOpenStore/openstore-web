FROM node:5.11
MAINTAINER Brian Douglass

RUN npm install -g webpack@1.13.1 webpack-dev-server@1.13.0

EXPOSE 8081
WORKDIR /srv/openstore
CMD ["npm", "run", "webpack-dev"]
