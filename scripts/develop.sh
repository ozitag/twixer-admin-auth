npm install -g yarn
yarn install
docker build -t ozitag/tager-admin-auth .
docker stop tager-admin-auth
docker run --rm -d -p 3000:80 --name=tager-admin-auth -v=$(pwd)/build:/usr/share/nginx/html ozitag/tager-admin-auth
open http://localhost:3000
gulp watch