import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class GruposMiembrosService extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('grupo_miembros', mysqlConnector)
  }
}
