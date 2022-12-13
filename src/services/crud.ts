import { ICrud } from '../interfaces/ICrud.interface'
import { MySQLConnector } from '../config/mysql.connector'

export class CRUD implements ICrud {
  constructor (public table: string, public mysqlConnector: MySQLConnector) {
    Object.assign(this, table)
  }

  async create (data: any) {
    const labels = Object.keys(data)
    const values = Object.values(data)
    const keys: string[] = []
    for (let i = 0; i < labels.length; i++) {
      keys[i] = '?'
    }
    const sql = `INSERT INTO ${this.table} (${labels.toString()}) VALUES(${keys.toString()});`
    return await this.mysqlConnector.execute(sql, values)
  }

  async find () {
    const sql = `SELECT * FROM  ${this.table};`
    return await this.mysqlConnector.execute(sql, [])
  }

  async findById (id: number) {
    const sql = `SELECT * FROM  ${this.table} WHERE  id = ?;`
    return await this.mysqlConnector.execute(sql, [id])
  }

  async findByParam (props: string, value: any) {
    const sql = `SELECT * FROM  ${this.table} WHERE  ${props.trim()} = ?;`
    return await this.mysqlConnector.execute(sql, [value])
  }

  async findByParamAnd (props: string [], value: string[]) {
    const sql = `SELECT * FROM  ${this.table} WHERE ${props[0].trim()}= ? and ${props[1].trim()}= ?;`
    return await this.mysqlConnector.execute(sql, value)
  }

  async update (data: any, id: number) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return new Error(`Method not implemented. ${data} ${id}`)
  }

  async delete (id: number) {
    return new Error(`Method not implemented. ${id}`)
  }
}
