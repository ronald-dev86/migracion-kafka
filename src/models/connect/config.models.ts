import { Iconfig } from '../../interfaces/IConfig.interface'

export class ConfigModel {
  constructor (public config: Iconfig) {
    Object.assign(this, config)
  }

  getConfig (): Iconfig {
    return this.config
  }
}
