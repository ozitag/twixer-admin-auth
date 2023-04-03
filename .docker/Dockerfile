FROM nginx:alpine

WORKDIR /srv

RUN apk add --update make git python3 g++ nodejs npm

COPY ./package.json /srv/package.json
COPY ./src /srv/src
COPY ./vite.config.ts /srv/vite.config.ts
COPY ./index.html /srv/index.html

RUN npm i

COPY ./.docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "sh", "/entrypoint.sh" ]