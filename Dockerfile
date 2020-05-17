FROM nginx:alpine

WORKDIR /srv

RUN apk add --update make git python g++ nodejs npm

COPY ./package.json /srv/package.json
RUN npm install

COPY ./gulpfile.js /srv/gulpfile.js
COPY ./assets /srv/assets
COPY ./src /srv/src

COPY ./scripts/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "sh", "/entrypoint.sh" ]