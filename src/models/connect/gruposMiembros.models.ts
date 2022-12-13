import { IGruposMiembros } from '../../interfaces/IGruposMiembros.interface'

export class GroupMembersModel {
  constructor (public grupoMiembros: IGruposMiembros) {
    Object.assign(this, grupoMiembros)
  }

  getGrupoMiembro (): IGruposMiembros {
    return this.grupoMiembros
  }
}
