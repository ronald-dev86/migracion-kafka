import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class UsersService extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('users', mysqlConnector)
  }
}
