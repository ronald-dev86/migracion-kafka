import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class EmailsUsersServices extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('users_email', mysqlConnector)
  }
}
