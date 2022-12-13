import * as fs from 'fs'
import * as path from 'path'

export class HandlerStudent {
  async getStudentsTxt (document: string) {
    try {
      const students = await fs.readFileSync(path.join(__dirname, `../document/${document}`), 'utf8')
      if (!students) return []
      const arrayStudent = students.split(',')
      return arrayStudent
    } catch (error: any) {
      console.error(error)
      throw new Error(error)
    }
  }

  async writeItemJson (student: any, document: string) {
    const data = await fs.readFileSync(path.join(__dirname, `../document/${document}`), 'utf8')
    const json = JSON.parse(data)
    json.push(student)
    await fs.writeFileSync(path.join(__dirname, `../document/${document}`), JSON.stringify(json))
    console.log('[WRITE-FILE]: Objeto guardado con exito')
  }

  async deleteItemJson (student: any, document: string) {
    const data = await fs.readFileSync(path.join(__dirname, `../document/${document}`), 'utf8')
    const json = JSON.parse(data)
    const result = json.filter(row => row.documentNumber !== student.documentNumber)
    await fs.writeFileSync(path.join(__dirname, `../document/${document}`), JSON.stringify(result))
  }

  async getListOfNewStudents () {
    try {
      const data = await fs.readFileSync(path.join(__dirname, '../document/studentsToProcess.json'), 'utf8')
      const json = JSON.parse(data)
      return json
    } catch (error) {
      return []
    }
  }

  async writeNewDniStudents (dni: string, document: string) {
    try {
      const arrayStudent = await this.getStudentsTxt(document)
      if (arrayStudent.length === 0) await fs.writeFileSync(path.join(__dirname, `../document/${document}`), dni)
      const found = arrayStudent.filter(row => row === dni)?.length

      if (found) {
        console.log('[WRITE-FILE]: DNI ya existe', dni)
        return false
      }

      arrayStudent.push(dni)

      const data = arrayStudent.toString()
      await fs.writeFileSync(path.join(__dirname, `../document/${document}`), data)
      return true
    } catch (error) {
      console.error('[ERROR-WRITE-FILE]', error)
    }
  }

  async deleteDniStudent (dni: string, document: string) {
    const arrayStudent = await this.getStudentsTxt(document)
    const data = arrayStudent.filter(row => row !== dni)
    await fs.writeFileSync(path.join(__dirname, `../document/${document}`), data.toString())
  }
}
