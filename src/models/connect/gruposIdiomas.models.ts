import { IGruposIdiomas } from '../../interfaces/IGruposIdiomas.interface'

export class GroupLanguage {
  constructor (public grupoIdioma: IGruposIdiomas) {
    Object.assign(this, grupoIdioma)
  }

  getGrupoIdioma (): IGruposIdiomas {
    return this.grupoIdioma
  }
}
