# Redis live query tool
A redis client to connect to redis server then execute commands

## Features
- Execute redis command
- Store history queries for suggestion
- Easy to change servers

## How to use

Run in local `yaml-scene`
```sh
  yas -e URI=redis://0.0.0.0:6379/0 -f https://raw.githubusercontent.com/doanthuanthanh88/yas-redis/main/sharing/RedisLive.yas.yaml
```

Run via docker
```sh
  docker run --rm -it --name redis-live-query-tool \
  -p 5000:5000 \
  -e URI=redis://0.0.0.0:6379/0
  doanthuanthanh88/yaml-scene \
  -f \
  https://raw.githubusercontent.com/doanthuanthanh88/yas-redis/main/sharing/RedisLive.yas.yaml
```
