# Document
Describe all of elements in tool. (meaning, how to use...)

| Element | Description |  
|---|---|  
| --- | --- |
|[yas-redis](#user-content--yas-redis)| Execute redis command ...|  
|[yas-redis/Live](#user-content--yas-redis%2flive)| Live execute redis command ...|  
  
  
# Details
<a id="user-content--yas-redis" name="user-content--yas-redis"></a>
## yas-redis
Execute redis command  

```yaml
- yas-redis:
    title: Redis in localhost
    uri: redis://user:pass@ip:port/db
    opts:                                         # Redis options [ioredis](https://github.com/luin/ioredis/blob/df04dd8/lib/redis/RedisOptions.ts#L184)
    pretty: false                                 # Pretty format data. Default is true
    commands:                                     # Redis command
      - set name "thanh 01"                       # - Set "thanh 01" to key "name"
      - set age 10                                # - Set "10" to key "age"
      - flushdb                                   # - flushdb, flushall

      - title: Cached post data                   # Command title
        cmd: hset post 10 '{"name": 10}'          # Redis command

      - cmd:                                      # Command with args for object
          - hmset
          - post
          - name: 10
            age: 11

      - title: Get post data in cached            # Command title
        cmd: hget post 10                         # Redis command
        var: post                                 # Set result to "post" variable

      - cmd: !function                            # Write code in command
          ({redis})                               # Declare variable is used. Redis is [ioredis](https://github.com/luin/ioredis)
          await redis.set('name', thanh)          # Need "await" when use redis functions then return value to apply to variable
          const rs = await redis.get('name')
          return rs
        var: nameValue

- Echo/Green: ${post}
```

<br/>

<a id="user-content--yas-redis%2flive" name="user-content--yas-redis%2flive"></a>
## yas-redis/Live
Live execute redis command  

```yaml
- yas-redis/Live:
    uri: redis://user:pass@ip:port/db
    opts:                                   # Redis options (ioredis).
                                            # - Reference to https://github.com/luin/ioredis/blob/df04dd8/lib/redis/RedisOptions.ts#L184
    pretty: false                           # Pretty format data
    limit: 3                                # Num of line show in history
    history: true                           # Reset history or not
                                            # - true: Store commands histories
                                            # - false: Dont store commands histories
                                            # - "clean": Clean old histories before store again
```

<br/>

  