FROM node:12-buster as build-stage

WORKDIR /srv

COPY ./package.json /srv/package.json
RUN npm install

COPY ./assets /srv/assets
COPY ./src /srv/src
COPY ./gulpfile.js /srv/gulpfile.js

ENV PAGE_TITLE $PAGE_TITLE
ENV BASE_PATH $BASE_PATH
ENV IS_LOGO_PNG $IS_LOGO_PNG

RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /srv/build /usr/share/nginx/html