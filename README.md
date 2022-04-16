# yas-redis
A Redis client

> It's an extension for `yaml-scene`  

## Features:
- Redis live query tool
- Execute redis command in scenario

> Easy to create step by step for migration  
> Easy to connect to many servers

## Sharing
1. [Redis live query tool](./sharing/README.md)

## Details document
> [Wiki Pages](./GUIDE.md)

## Prerequisite
- Platform [`yaml-scene`](https://www.npmjs.com/package/yaml-scene)

## Installation

```sh
  yas add yas-redis        # npm install -g yas-redis OR yard global add yas-redis
```

## Example
[Examples scenario files](./scenes/test)

## Redis executor
Execute redis command in scenario

```yaml
- yas-redis:
    title: Redis in localhost
    uri:                                      # redis://user:pass@ip:port/db
    commands:                                 # Redis command
      - set name "thanh 01"                   # - Set "thanh 01" to key "name"
      - set age 10                            # - Set "10" to key "age"

      - flushdb                               # - flushdb, flushall

      - cmd:                                  # Command with args for object
          - hmset
          - post
          - name: 10
            age: 11

      - title: Cached post data               # Command title
        cmd: hset post 10 '{"name":10}'       # Redis co  

      - title: Get post data in cached        # Command title
        cmd: hget post 10                     # Redis command
        var: post                             # Set result to "post" var  
        
      - cmd: !function                        # Write code in command
          () {                                # Declare variable is used. Redis is [ioredis](https://github.com/luin/ioredis)
            await this.redis.set('name', thanh)    # Need "await" when use redis functions then return value to apply to variable
            const rs = await this.redis.get('name')
            return rs
          }
        var: nameValue
```

# Live redis executor

```yaml
- yas-redis/Live:
    uri:                          # redis://user:pass@ip:port/db
    opts:                         # Redis options (ioredis).
                                  # - Reference to https://github.com/luin/ioredis/blob/df04dd8/lib/redis/RedisOptions.ts#L184
    pretty: false                 # Pretty format data
    limit: 3                      # Num of line show in history
    history: true                 # Reset history or not
                                  # - true: Store commands histories
                                  # - false: Dont store commands histories
                                  # - "clean": Clean old histories before store again
```