import { Iusers } from '../../interfaces/IUsers.interface'
export class UsersModel {
  constructor (public user: Iusers) {
    Object.assign(this, user)
  }

  getUser (): Iusers {
    return this.user
  }
}
