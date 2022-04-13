import { ElementFactory } from "yaml-scene/src/elements/ElementFactory";
import UserInput from "yaml-scene/src/elements/UserInput";
import { AutoCompleteSuggestion } from 'yaml-scene/src/elements/UserInput/question/AutoCompleteSuggestion';
import { VariableManager } from "yaml-scene/src/singleton/VariableManager";
import { Functional } from 'yaml-scene/src/tags/model/Functional';
import { Cached } from "./Cached";
import { Redis } from './Redis';

export type Cmd = { title?: string, cmd: string[] | string, args?: string[], var?: any }

/*****
 * @name yas-redis/Live
 * @description Live execute redis command
 * @example
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
 */

export class Live extends Redis {
  history?: boolean | 'clean'
  limit?: number
  private _cmdCaches?: Cached

  constructor() {
    super()
    if (this.history === undefined) this.history = true
    if (this.limit === undefined) this.limit = 3
  }

  /**
   * Init properties from yaml to the element. Only handle raw data
   * @param {any} props Element attribute which is passed from scenario yaml file
   * @override
   */
  init(props: { uri: string, title?: string, description?: string, history?: boolean | 'clean', limit?: number }) {
    super.init(props)
    if (this.history === undefined) this.history = true
    if (this.limit === undefined) this.limit = 3
  }

  /**
   * Create and prepare data for element.
   * @override
   */
  async prepare() {
    await this.proxy.applyVars(this, 'history', 'limit')
    await super.prepare()
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
      if (!this._cmdCaches && this.history) {
        this._cmdCaches = new Cached(this.uri, this.history)
        await this._cmdCaches.load()
      }
      while (true) {
        const inputCmd = ElementFactory.CreateTheElement(UserInput)
        inputCmd.init({
          title: 'Enter command',
          fallback: '  ',
          type: 'autocomplete',
          limit: this.limit,
          choices: Array.from(this._cmdCaches?.data || []).map(e => {
            return {
              title: e,
              value: e
            }
          }),
          suggest: AutoCompleteSuggestion.INCLUDE_AND_ALLOW_NEW,
          required: true,
          var: 'cmd'
        })
        await inputCmd.prepare()
        const { cmd } = await inputCmd.exec() as { cmd: string }
        try {
          const newCmd = await this.runCommand({
            cmd
          })
          if (!(newCmd instanceof Functional)) this._cmdCaches?.push(cmd)
          this.proxy.logger.info('')
        } catch (err: any) {
          this.proxy.logger.error(VariableManager.Instance.vars.$$text.red(err.message))
        } finally {
          await inputCmd.dispose()
        }
      }
    } finally {
      if (this.title) console.groupEnd()
    }
  }

}
