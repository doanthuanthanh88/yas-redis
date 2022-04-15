import { join } from "path"
import { Simulator } from "yaml-scene/src/Simulator"
import { VariableManager } from "yaml-scene/src/singleton/VariableManager"

test('Array command', async () => {
  await Simulator.Run(`
vars:
  REDIS_HOST: 0.0.0.0
extensions:
  yas-redis: ${join(__dirname, '../src')}
steps:
  - yas-redis:
      uri: redis://\${REDIS_HOST}:6379/9
      commands:
        - flushdb
        
        - cmd: ['set', 'name1', 'thanh']
        - title: Get name
          cmd: ['get', 'name1']
          var: name1
`)
  expect(VariableManager.Instance.vars.name1).toEqual('thanh')
})



test('String command', async () => {
  await Simulator.Run(`
vars:
  REDIS_HOST: 0.0.0.0
extensions:
  yas-redis: ${join(__dirname, '../src')}
steps:
  - yas-redis:
      uri: redis://\${REDIS_HOST}:6379/9
      commands:
        - flushdb
        
        - set name1 'thanh 01'
        - cmd: get name1
          var: name1
`)
  expect(VariableManager.Instance.vars.name1).toEqual('thanh 01')
})

test('Eval command', async () => {
  await Simulator.Run(`
vars:
  REDIS_HOST: 0.0.0.0
extensions:
  yas-redis: ${join(__dirname, '../src')}
steps:
  - yas-redis:
      uri: redis://\${REDIS_HOST}:6379/9
      commands:
        - flushdb
        
        - !function |
          await redis.set('name1', 'thanh')
        - cmd: !function |
            const rs = await redis.get('name1')
            return rs
          var: name1
`)
  expect(VariableManager.Instance.vars.name1).toEqual('thanh')
})
