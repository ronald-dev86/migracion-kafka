import { KafkaService } from '../../config/kafka'
import { DATA_SOURCES } from '../../config/vars.config'
import { UsersModel } from '../../models/connect/users.models'
import { UsersEmailsModel } from '../../models/connect/usersEmails.models'
import { ConfigService } from '../../services/config.service'
import { UsersService } from '../../services/users.service'
import { EmailsUsersServices } from '../../services/usersEmails.service'
import * as moment_timezone from 'moment-timezone'
import { GruposIdiomasService } from '../../services/gruposIdiomas.service'
import { GruposMiembrosService } from '../../services/gruposMiembros.service'
import { GruposService } from '../../services/grupos.service'
import { StudentRecordService } from '../../services/studentRecord.service'
import { GroupMembersModel } from '../../models/connect/gruposMiembros.models'
import { GroupLanguage } from '../../models/connect/gruposIdiomas.models'
import { GroupModel } from '../../models/connect/grupos.models'
import { MySQLConnector } from '../../config/mysql.connector'
import { HandlerStudent } from '../../config/handler'

export class Ues21Ctrls {
  mysqlConnector = new MySQLConnector()
  dataSource = DATA_SOURCES.kafkaSources
  defaultProps = DATA_SOURCES.DEFAULT_PROPS
  kafka = new KafkaService()
  topics = this.dataSource.topics()
  userDefaultRol: any
  dateNow = moment_timezone.tz(new Date(), this.defaultProps.TIMEZONE)

  constructor (
    public serviceUser: UsersService,
    public configService: ConfigService,
    public emailsUserService: EmailsUsersServices,
    public groupService: GruposService,
    public groupLenguajeService: GruposIdiomasService,
    public groupMemberService: GruposMiembrosService,
    public studentRecordService: StudentRecordService) {
    this.getUserDefaultRol()
  }

  async getUserDefaultRol () {
    try {
      const data: any = await this.configService.findByParam('`key`', 'USER_DEFAULT_ROL')
      if (data.lenght === 0) return
      this.userDefaultRol = data[0].value
      console.log('[INFO-SYSTEM]: Rol de usuario cargado')
    } catch (e) {
      console.error(e)
    }
  }

  async hearTopicUserContact (cb: any) {
    try {
      this.kafka.sockectKafkaConsumer(this.topics[0], async ({ cm, data }: any) => {
        if (cm && !data) cb({ consumer: cm, reset: false })
        if (!data) return
        cb({ consumer: cm, reset: true })
        const document = 'ues21_students.txt'
        const student = data.data

        if (!student.documentNumber) {
          console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE] Descartada la informacion, Numero Documento vacio!')
          return
        }
        const found: any = await this.serviceUser.findByParam('dni', student.documentNumber)
        if (Object.entries(found).length !== 0) {
          console.log(`[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE] Connect ya tiene este usuario Registrado! ${student.documentNumber}`)
          return
        }
        const instaceHandler = new HandlerStudent()
        console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE]: Numero de Documento enviado a guardar en txt', student.documentNumber)
        const continueSave = await instaceHandler.writeNewDniStudents(student.documentNumber.toString(), document)
        if (!continueSave) return
        instaceHandler.writeItemJson(student, 'studentsToProcess.json')
      })
    } catch (error) {
      console.error(error)
    }
  }

  async hearTopicUserEmployee (cb: any) {
    try {
      this.kafka.sockectKafkaConsumer(this.topics[1], async ({ cm, data }: any) => {
        if (cm && !data) cb({ consumer: cm, reset: false })
        if (!data) return
        cb({ consumer: cm, reset: true })
        const instaceHandler = new HandlerStudent()
        const document = 'ues21_employee.txt'
        if (!data.ICNUM) {
          console.log('[TOPIC: USER.EMPLOYEE] Descartada la informacion, Numero Documento vacio!')
          return
        }
        const found: any = await this.serviceUser.findByParam('dni', data.ICNUM.toString().trim())
        if (Object.entries(found).length !== 0) {
          console.log(`[TOPIC: USER.EMPLOYEE] Este usuario ya existe ${data.ICNUM}`)
          return
        }
        const continueSave = await instaceHandler.writeNewDniStudents(data.ICNUM.toString().trim(), document)
        if (!continueSave) return
        console.log(`[TOPIC: USER.EMPLOYEE] Inicio el proceso de guardado: ${data.ICNUM}`)
        const user = new UsersModel({
          dni: data.ICNUM.trim(),
          nombre: data.VORNA.trim(),
          apellido: data.NACHN.trim(),
          email: data.USRTY.toLowerCase().trim(),
          id_tipo: 4,
          id_pais: this.defaultProps.ID_PAIS,
          id_idioma: this.defaultProps.ID_IDIOMA,
          tipo_documento: this.defaultProps.DOCUMENTS_TYPES,
          rol: this.userDefaultRol,
          created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
          connection_status: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
          last_connection_status: this.dateNow.format('YYYY-MM-DD hh:mm:ss')
        })
        const savedUser: any = await this.serviceUser.create(user.getUser())
        if (!savedUser.affectedRows) return

        const emails = new UsersEmailsModel({
          id_user: savedUser.insertId,
          email: data.USRTY,
          created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
          active: 1,
          send_last_link: 0
        })
        this.emailsUserService.create(emails.getUserEmail())
        console.log(`[TOPIC: USER.EMPLOYEE] Proceso de registro completo para: ${data.ICNUM}`)
        instaceHandler.deleteDniStudent(data.ICNUM.toString().trim(), document)
      })
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getNameGroupUnionNameAndYear (name: string, year: string) {
    return `${name.toLocaleLowerCase()} ${year.toLocaleLowerCase()}`
  }

  capitalize (s: string) {
    return s
      .split(' ')
      .map((letter) => letter.charAt(0).toUpperCase() + letter.substring(1).toLowerCase())
      .join(' ')
  }

  async studentSavingProcessByJson () {
    const instaceHandler = new HandlerStudent()
    const students = await instaceHandler.getListOfNewStudents()
    const document = 'ues21_students.txt'
    let i = students.length
    while (i--) {
      console.log(`[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE] Inicio el proceso de guardado: ${students[i].documentNumber}`)
      const user = new UsersModel({
        dni: students[i].documentNumber,
        nombre: String(this.capitalize(students[i].name)),
        apellido: String(this.capitalize(students[i].lastName)),
        email: students[i].secondaryEmail.toLowerCase().trim(),
        id_tipo: 1,
        id_pais: this.defaultProps.ID_PAIS,
        id_idioma: this.defaultProps.ID_IDIOMA,
        tipo_documento: this.defaultProps.DOCUMENTS_TYPES,
        rol: this.userDefaultRol,
        created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
        connection_status: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
        last_connection_status: this.dateNow.format('YYYY-MM-DD hh:mm:ss')
      })

      const savedUser: any = await this.serviceUser.create(user.getUser())

      if (!savedUser.affectedRows) continue

      const emails = new UsersEmailsModel({
        id_user: savedUser.insertId,
        email: students[i].secondaryEmail.toLowerCase().trim(),
        created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
        active: 1,
        send_last_link: 0
      })

      await this.emailsUserService.create(emails.getUserEmail())
      const dateGroup = students[i].graduateDate !== null ? students[i].graduateDate.split('-') : students[i].startDate.split('-')
      const nameGroup = await this.getNameGroupUnionNameAndYear(students[i].careerStudyPlan.career.name, dateGroup[0])
      const foundGroup: any = await this.groupLenguajeService.findByParam('titulo', nameGroup)
      let groupID = 0
      if (Object.entries(foundGroup).length === 0) {
        const group = new GroupModel({
          thumbnail: this.defaultProps.DEFAULT_IMAGE_CAMADA,
          imagen: this.defaultProps.DEFAULT_IMAGE_CAMADA,
          chat: 1,
          chat_room: 'n/a',
          created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
          es_moderado: 0,
          id_tipoinscripcion: 7,
          tipo_grupo: this.defaultProps.DEFAULT_ID_CAMADA,
          only_inscribed: 1,
          publicado: true,
          valida_inscripcion: 1
        })
        const savedGroup: any = await this.groupService.create(group.getGrupo())

        if (!savedGroup.affectedRows) continue

        groupID = savedGroup.insertId

        const groupLenguaje = new GroupLanguage({
          id_grupo: groupID,
          id_idioma: this.defaultProps.ID_IDIOMA,
          titulo: String(this.capitalize(nameGroup)),
          created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss')
        })

        await this.groupLenguajeService.create(groupLenguaje.getGrupoIdioma())
      }

      if (groupID === 0) groupID = foundGroup[0].id_grupo

      const groupMember = new GroupMembersModel({
        created_at: this.dateNow.format('YYYY-MM-DD hh:mm:ss'),
        id_grupo: groupID,
        id_tipo_autoridad: 4,
        id_user: savedUser.insertId,
        moderador: 0
      })

      await this.groupMemberService.create(groupMember.getGrupoMiembro())
      console.log(`[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE] Proceso de registro completo para: ${students[i].documentNumber}`)
      await instaceHandler.deleteDniStudent(students[i].documentNumber.toString(), document)
      await instaceHandler.deleteItemJson(students[i], 'studentsToProcess.json')
      if (i === 0) {
        console.log('[TOPIC: ACADEMIC-LIFE.ENROLLMENT-COMPLETE] Proceso de registros completo Exitosamente')
      }
    }
  }
}
