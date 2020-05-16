FROM nginx:alpine

WORKDIR /srv

RUN apk update && apk add make git python g++
RUN apk add --update nodejs npm && npm install -g gulp

COPY ./assets /srv/assets
COPY ./src /srv/src
COPY ./gulpfile.js /srv/gulpfile.js
COPY ./package.json /srv/package.json

RUN npm install && gulp build
RUN cp -R /srv/build/* /usr/share/nginx/html