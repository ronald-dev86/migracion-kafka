import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class GruposIdiomasService extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('grupos_idioma', mysqlConnector)
  }
}
