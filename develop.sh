#npm install -g yarn
#yarn install
#rm -rf build
#gulp build
docker build -t ozitag/tvixer-admin-auth .
docker stop tvixer-admin-auth
#docker run --rm -d -p 3000:80 --name=tvixer-admin-auth -v=$(pwd)/build:/usr/share/nginx/html ozitag/tvixer-admin-auth
docker run --rm -d -p 3000:80 --name=tvixer-admin-auth ozitag/tvixer-admin-auth
open http://localhost:3000
#gulp watch