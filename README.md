Develop:
```
docker build -t ozitag/tager-admin-auth --file .docker/Dockerfile .
docker stop tager-admin-auth
docker run --rm -d -p 3003:80 --name=tager-admin-auth-v4 -v=$(pwd)/config.json:/srv/config.json -v=$(pwd)/public:/srv/public ozitag/tager-admin-auth-v4
open http://localhost:3003
```

Publish:
```
sudo docker login --username ozitag && 
sudo docker build --platform linux/amd64 -t ozitag/tager-admin-auth --file .docker/Dockerfile . &&
sudo docker push ozitag/tager-admin-auth
```

Use in TAGER, docker-compose.yml:
```
  admin-auth:
    container_name: ${APP_NAME}-admin-auth
    image: ozitag/tager-admin-auth:latest
    volumes:
      - ./docker/admin-auth/public:/srv/public
      - ./docker/admin-auth/config-dev.json:/srv/config.json
```
