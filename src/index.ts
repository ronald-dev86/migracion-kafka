import * as cron from 'node-cron'
import { MySQLConnector } from './config/mysql.connector'
import { Ues21Ctrls } from './controllers/ues21/ues21.ctrls'
import { ConfigService } from './services/config.service'
import { EmailsUsersServices } from './services/usersEmails.service'
import { UsersService } from './services/users.service'
import { StudentRecordService } from './services/studentRecord.service'
import { GruposService } from './services/grupos.service'
import { GruposIdiomasService } from './services/gruposIdiomas.service'
import { GruposMiembrosService } from './services/gruposMiembros.service'
import { KafkaService } from './config/kafka'
import { clearTimeout } from 'timers'
import { DATA_SOURCES } from './config/vars.config'

class App {
  mysqlConnector = new MySQLConnector()
  configService = new ConfigService(this.mysqlConnector)
  usersService = new UsersService(this.mysqlConnector)
  usersEmailsServices = new EmailsUsersServices(this.mysqlConnector)
  groupService = new GruposService(this.mysqlConnector)
  groupLenguajeService = new GruposIdiomasService(this.mysqlConnector)
  gruopMembersService = new GruposMiembrosService(this.mysqlConnector)
  studentRecordService = new StudentRecordService()
  kafka = new KafkaService()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises

  closeTopicEmployee: any
  closeTopicContact: any

  datasource = DATA_SOURCES.cron
  default = DATA_SOURCES.DEFAULT_PROPS

  constructor () {
    this.mysqlConnector.init()
  }

  init (topic: string) {
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

      if (topic) {
        switch (topic) {
          case 'employee':
            instanceUES21.hearTopicUserEmployee(({ consumer, reset }: any) => {
              if (!reset) {
                this.closeTopicEmployee = setTimeout(() => {
                  console.log('[TOPIC: USER.EMPLOYEE]: Cerrado Conexion del topic, no se recibio Data')
                  consumer.disconnect()
                }, 240000)
              } else {
                console.log(new Date(), 'reinicio cierre')
                clearTimeout(this.closeTopicEmployee)
                this.closeTopicEmployee = setTimeout(() => {
                  console.log('[TOPIC: USER.EMPLOYEE]: Cerrado Conexion del topic')
                  consumer.disconnect()
                }, 60000)
              }
            })
            break
          case 'contact':
            instanceUES21.hearTopicUserContact(({ consumer, reset }: any) => {
              if (!reset) {
                this.closeTopicContact = setTimeout(() => {
                  console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE]: Cerrado Conexion del topic. No se recibio data')
                  consumer.disconnect()
                  instanceUES21.studentSavingProcessByJson()
                }, 240000)
              } else {
                clearTimeout(this.closeTopicContact)
                this.closeTopicContact = setTimeout(() => {
                  console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE]: Cerrado Conexion del topic')
                  consumer.disconnect()
                  instanceUES21.studentSavingProcessByJson()
                }, 60000)
              }
            })
            break
          default:
            console.log('[INFO-SYSTEM] Ese topic no existe')
            break
        }
      } else {
        switch (process.env.CLIENT_NAME) {
          case 'UES21':
            cron.schedule(this.datasource.START_CRON_TOPIC_CONTACT, () => {
              instanceUES21.hearTopicUserContact(({ consumer, reset }: any) => {
                if (!reset) {
                  this.closeTopicContact = setTimeout(() => {
                    console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE]: Cerrado Conexion del topic. No se recibio data')
                    consumer.disconnect()
                    instanceUES21.studentSavingProcessByJson()
                  }, 240000)
                } else {
                  clearTimeout(this.closeTopicContact)
                  this.closeTopicContact = setTimeout(() => {
                    console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE]: Cerrado Conexion del topic')
                    consumer.disconnect()
                    instanceUES21.studentSavingProcessByJson()
                  }, 60000)
                }
              })
            },
            {
              scheduled: true,
              timezone: this.default.TIMEZONE
            }).start()

            // eslint-disable-next-line no-case-declarations
            cron.schedule(this.datasource.START_CRON_TOPIC_EMPLOYEE, () => {
              instanceUES21.hearTopicUserEmployee(({ consumer, reset }: any) => {
                if (!reset) {
                  this.closeTopicEmployee = setTimeout(() => {
                    console.log('[TOPIC: USER.EMPLOYEE]: Cerrado Conexion del topic, no se recibio Data')
                    consumer.disconnect()
                  }, 240000)
                } else {
                  console.log(new Date(), 'reinicio cierre')
                  clearTimeout(this.closeTopicEmployee)
                  this.closeTopicEmployee = setTimeout(() => {
                    console.log('[TOPIC: USER.EMPLOYEE]: Cerrado Conexion del topic')
                    consumer.disconnect()
                  }, 60000)
                }
              })
            },
            {
              scheduled: true,
              timezone: this.default.TIMEZONE
            }).start()
            break

          default:
            console.error('[CONFIG-ENV]: cliente no encontrado')
            throw new Error()
        }
      }
    })
  }
}

const argv = process.argv.slice(2)
const initTopic = argv[0]?.trim()

export const app = new App()
app.init(initTopic)
