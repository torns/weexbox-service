import { readFileSync, writeFileSync, writeJsonSync } from 'fs-extra'
import Context from './context'
import Config from './config'
const timestamp = require('time-stamp')
import { relative } from 'path'
import { sync } from 'md5-file'
import * as readDir from 'readdir'

export default class Md5 {
  md5: string
  path: string

  static calculate() {
    const context = new Context()
    const files = readDir.readSync(context.wwwFolderPath, ['**.js'], readDir.ABSOLUTE_PATHS)
    const results = new Array()
    files.forEach(file => {
      results.push(this.hashFile(file, context))
    })
    writeJsonSync(context.md5FilePath, results, { spaces: 2})
    writeJsonSync(context.configFilePath, this.prepareConfig(context), { spaces: 2})
  }

  static prepareConfig(context: Context): Config {
    let config = new Config()
    try {
      config = JSON.parse(readFileSync(context.defaultConfigFilePath, 'utf8'))
      config.release = process.env.VERSION || this.calculateTimestamp()
    } catch (e) {
      config.autogenerated = true
      config.release = this.calculateTimestamp()
    }
    return config
  }

  static calculateTimestamp(): string {
    return timestamp('YYYY.MM.DD.HH.mm.ss')
  }

  static hashFile(file: string, context: Context): Md5 {
    const md5 = sync(file)
    const path = relative(context.wwwFolderPath, file).replace(new RegExp('\\\\', 'g'), '/')
    const m5 = new Md5()
    m5.md5 = md5
    m5.path = path
    return m5
  }
}
