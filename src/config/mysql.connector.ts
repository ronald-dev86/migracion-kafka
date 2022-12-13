import { createPool } from 'mysql'
import { DATA_SOURCES } from './vars.config'
import { BehaviorSubject } from 'rxjs'

export class MySQLConnector {
  dataSource = DATA_SOURCES.mySqlDataSource
  pool: any
  ready: BehaviorSubject<boolean> = new BehaviorSubject(false)
  init () {
    try {
      this.pool = createPool({
        connectionLimit: this.dataSource.DB_CONNECTION_LIMIT,
        host: this.dataSource.DB_HOST,
        user: this.dataSource.DB_USER,
        password: this.dataSource.DB_PASSWORD,
        database: this.dataSource.DB_DATABASE,
        port: this.dataSource.DB_PORT
      })
      console.log('[INFO-SYSTEM] Conexion de la base de datos establecida')
      this.ready.next(true)
    } catch (error: any) {
      console.error('[mysql.connector][init][Error]: ', error)
      throw new Error('failed to initialized pool')
    }
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  execute <T>(query: string, params: string[] | Object): Promise<T> {
    try {
      if (!this.pool) throw new Error('Pool was not created. Ensure pool is created when running the app.')

      return new Promise<T>((resolve, reject) => {
        this.pool.query(query, params, (error: any, results: any) => {
          if (error) reject(error)
          else resolve(results)
        })
      })
    } catch (error) {
      console.log('[mysql.connector][execute][Error]: ', error)
      throw new Error('failed to execute MySQL query')
    }
  }
}
