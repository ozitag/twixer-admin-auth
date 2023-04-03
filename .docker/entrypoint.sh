#!/bin/bash

cd /srv || exit
npm run build-only
cp -r /srv/dist/* /usr/share/nginx/html
nginx -g "daemon off;"