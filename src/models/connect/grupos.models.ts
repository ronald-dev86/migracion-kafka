import { IGrupos } from '../../interfaces/IGrupos.interface'

export class GroupModel {
  constructor (public grupos: IGrupos) {
    Object.assign(this, grupos)
  }

  getGrupo (): IGrupos {
    return this.grupos
  }
}
