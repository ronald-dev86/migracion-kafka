import { MySQLConnector } from './config/mysql.connector'
import { Ues21Ctrls } from './controllers/ues21/ues21.ctrls'
import { ConfigService } from './services/config.service'
import { GruposService } from './services/grupos.service'
import { GruposIdiomasService } from './services/gruposIdiomas.service'
import { GruposMiembrosService } from './services/gruposMiembros.service'
import { StudentRecordService } from './services/studentRecord.service'
import { UsersService } from './services/users.service'
import { EmailsUsersServices } from './services/usersEmails.service'

class RunJson {
  mysqlConnector = new MySQLConnector()
  configService = new ConfigService(this.mysqlConnector)
  usersService = new UsersService(this.mysqlConnector)
  usersEmailsServices = new EmailsUsersServices(this.mysqlConnector)
  groupService = new GruposService(this.mysqlConnector)
  groupLenguajeService = new GruposIdiomasService(this.mysqlConnector)
  gruopMembersService = new GruposMiembrosService(this.mysqlConnector)
  studentRecordService = new StudentRecordService()

  constructor () {
    this.mysqlConnector.init()
  }

  start () {
    const instanceUES21 = new Ues21Ctrls(
      this.usersService,
      this.configService,
      this.usersEmailsServices,
      this.groupService,
      this.groupLenguajeService,
      this.gruopMembersService,
      this.studentRecordService)

    this.mysqlConnector.ready.subscribe((ready) => {
      if (!ready) return
      setTimeout(() => {
        instanceUES21.studentSavingProcessByJson()
      }, 4000)
    })
  }
}
export const run = new RunJson()
run.start()
