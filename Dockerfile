FROM nginx:alpine

WORKDIR /srv

RUN apk update && apk add make git python g++
RUN apk add --update nodejs npm && npm install -g gulp

COPY ./ /srv

RUN npm install && gulp build
RUN cp -R /srv/build/* /usr/share/nginx/html