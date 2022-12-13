import fetch from 'node-fetch'
import { DATA_SOURCES } from '../config/vars.config'

export class StudentRecordService {
  apiInfo = DATA_SOURCES.API_INFO

  async getAuthApi () {
    try {
      const params = new URLSearchParams()
      params.append('client_id', this.apiInfo.BODY_AUTH.client_id)
      params.append('client_secret', this.apiInfo.BODY_AUTH.client_secret)
      params.append('grant_type', this.apiInfo.BODY_AUTH.grant_type)
      params.append('scope', this.apiInfo.BODY_AUTH.scope)

      const response = await fetch(this.apiInfo.URL_AUTH, { method: 'POST', body: params })
      const data = await response.json()

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${data.token_type} ${data.access_token}`
    } catch (error) {
      console.log('error', error)
      throw new Error('Error al solicitar acceso')
    }
  }

  async getStudentRecord (student: string) {
    try {
      const url = this.apiInfo.URL_STUDENT_RECORD.concat(student)
      const token = `bearer ${DATA_SOURCES.token}`
      const response = await fetch(url, { headers: { Authorization: token } })
      const data = await response.json()
      return data
    } catch (error) {
      console.log(error)
    }
  }
}
