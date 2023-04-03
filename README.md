Develop:
```
docker build -t ozitag/tager-admin-auth --file .docker/Dockerfile .
docker stop tager-admin-auth
docker run --rm -d -p 3003:80 --name=tager-admin-auth-v4 -v=$(pwd)/config.json:/srv/config.json -v=$(pwd)/public:/srv/public ozitag/tager-admin-auth-v4
open http://localhost:3003
```

Publish:
```
docker login --username ozitag
docker build -t ozitag/tager-admin-auth --file .docker/Dockerfile .
docker push ozitag/tager-admin-auth
```