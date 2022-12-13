import { MySQLConnector } from '../config/mysql.connector'
import { CRUD } from './crud'

export class ConfigService extends CRUD {
  constructor (mysqlConnector: MySQLConnector) {
    super('config', mysqlConnector)
  }

  async create (data: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Method not implemented. ${data}`)
  }

  async findById (id: number) {
    return new Error(`Method not implemented. ${id}`)
  }
}
