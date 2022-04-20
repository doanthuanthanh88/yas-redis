import { tmpdir } from "os"
import { join } from "path"
import { FileReader } from "yaml-scene/src/elements/File/reader/FileReader"
import { IFileReader } from "yaml-scene/src/elements/File/reader/IFileReader"
import { JsonReader } from "yaml-scene/src/elements/File/reader/JsonReader"
import { FileWriter } from "yaml-scene/src/elements/File/writer/FileWriter"
import { IFileWriter } from "yaml-scene/src/elements/File/writer/IFileWriter"
import { JsonWriter } from "yaml-scene/src/elements/File/writer/JsonWriter"
import { VariableManager } from "yaml-scene/src/singleton/VariableManager"
import { FileUtils } from "yaml-scene/src/utils/FileUtils"


export class Cached {
  private tmpFile: string
  private reader: IFileReader
  private writer: IFileWriter
  data: Array<string>
  limit = 50

  constructor(uri: string, history: boolean | 'clean') {
    const key = VariableManager.Instance.vars.$$md5.encrypt(uri)
    this.tmpFile = join(tmpdir(), key)
    if (history === 'clean') this.clean()
    this.writer = new JsonWriter(new FileWriter(this.tmpFile))
    this.reader = new JsonReader(new FileReader(this.tmpFile))
    this.data = []
  }

  clean() {
    FileUtils.RemoveFilesDirs(this.tmpFile)
  }

  async load() {
    try {
      const cnt = await this.reader.read() as string[]
      if (cnt) {
        cnt.forEach(cmd => this.data.push(cmd))
      }
    } catch { }
  }

  async push(cmd: string) {
    const idx = this.data.indexOf(cmd)
    if (idx !== -1) {
      this.data.splice(idx, 1)
    }
    this.data.splice(0, 0, cmd)
    if (this.data.length > this.limit) {
      this.data.splice(this.limit - 10, 10)
    }
    await this.save()
  }

  async save() {
    await this.writer.write(this.data)
  }
}