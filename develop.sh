docker build -t ozitag/tvixer-admin-auth .
docker stop tvixer-admin-auth
docker run --rm -d -p 3000:80 --name=tvixer-admin-auth -v=$(pwd)/src:/usr/share/nginx/html ozitag/tvixer-admin-auth