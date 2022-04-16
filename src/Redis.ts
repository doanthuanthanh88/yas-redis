import IORedis, { Command, RedisOptions } from "ioredis";
import merge from "lodash.merge";
import { ElementProxy } from "yaml-scene/src/elements/ElementProxy";
import { IElement } from "yaml-scene/src/elements/IElement";
import { VariableManager } from "yaml-scene/src/singleton/VariableManager";
import { Functional } from 'yaml-scene/src/tags/model/Functional';

export type Cmd = { title?: string, cmd: string[] | string | Functional, args?: string[], var?: any }

/*****
 * @name yas-redis
 * @description Execute redis command
 * @example
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
          () {                                    # Load global variables into function. [More](https://github.com/doanthuanthanh88/yaml-scene/wiki#user-content-!tags-!function) 
            await this.redis.set('name', thanh)   # Need "await" when use redis functions then return value to apply to variable
            const rs = await this.redis.get('name')
            return rs
          }
        var: nameValue

- Echo/Green: ${post}
 */

export class Redis implements IElement {
  /**
   * Wrapper for this element
   * @override
   */
  proxy: ElementProxy<this>
  /**
   * This ref to parent Group element
   * @override
   */
  $$: IElement

  /**
   * This ref to this
   * @override
   */
  $: this

  pretty?: boolean
  title?: string
  uri: string
  commands: (Cmd | string)[]
  opts?: RedisOptions

  redis: IORedis

  /**
   * Init properties from yaml to the element. Only handle raw data
   * @param {any} props Element attribute which is passed from scenario yaml file
   * @override
   */
  init(props: { uri: string, title?: string }) {
    merge(this, props)
    if (this.pretty === undefined) this.pretty = true
  }

  /**
   * Create and prepare data for element.
   * @override
   */
  async prepare() {
    await this.proxy.applyVars(this, 'title', 'uri', 'commands', 'opts')
    this.redis = new IORedis(this.uri, this.opts)
  }

  /**
   * Element execute main tasks
   * @override
   */
  async exec() {
    if (this.title) this.proxy.logger.info(this.title)
    this.proxy.logger.debug(VariableManager.Instance.vars.$$text.gray.underline(this.uri))
    if (this.title) console.group()
    try {
      for (const command of this.commands) {
        let cmd: Cmd
        if (typeof command === 'string' || command instanceof Functional) {
          cmd = { cmd: command }
        }
        else cmd = command
        await this.runCommand(cmd)
        this.proxy.logger.info('')
      }
    } finally {
      if (this.title) console.groupEnd()
    }
  }

  protected async runCommand(command: Cmd) {
    let cmd = this.getCommand(command.cmd)
    command.title && this.proxy.logger.info(VariableManager.Instance.vars.$$text.green(command.title))
    let rs: any
    if (Array.isArray(cmd)) {
      const [name, ...args] = cmd
      this.proxy.logger.debug(VariableManager.Instance.vars.$$text.gray(name, ...args))
      rs = await this.redis.sendCommand(new Command(name, args, { replyEncoding: 'utf-8' }))
    } else if (typeof cmd === 'string') {
      const cmdString = cmd
      if (cmdString === 'clear') {
        console.clear()
        return null
      } else if (cmdString === 'flushdb') {
        rs = await this.redis.flushdb()
      } else if (cmdString === 'flushall') {
        rs = await this.redis.flushall()
      } else {
        rs = await this.proxy.getVar(cmdString, {
          redis: this.redis
        })
      }
    } else if (cmd instanceof Functional) {
      const _handler = cmd.getFunctionFromBody()
      rs = await this.proxy.call(_handler, undefined, { redis: this.redis })
    }
    this.proxy.logger.info(!this.pretty ? rs : JSON.stringify(rs, null, '  '))
    if (command.var) {
      await this.proxy.setVar(command.var, { _: rs }, '_')
    }
    return rs
  }

  async dispose() {
    await this.redis?.quit()
  }

  protected getCommand(cmd: string | string[] | Functional): string[] | Functional {
    if (typeof cmd === 'string') {
      const pt = /(("([^"]+)")|('([^']+)')|(([^\s]+)(\s|$)))/g
      let m: any
      const cmds = [] as string[]
      while (m = pt.exec(cmd)) {
        cmds.push(m[7] || m[5] || m[3])
      }
      return cmds
    }
    return cmd
  }

}
