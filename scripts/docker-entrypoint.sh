#!/bin/bash

cd /srv

npm run build

cp -r /srv/build/* /usr/share/nginx/html

nginx -g "daemon off;"