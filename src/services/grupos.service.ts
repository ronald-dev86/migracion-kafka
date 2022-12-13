import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class GruposService extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('grupos', mysqlConnector)
  }
}
