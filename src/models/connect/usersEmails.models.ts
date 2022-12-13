import { IUsersEmails } from '../../interfaces/IUsersEmails.interface'

export class UsersEmailsModel {
  constructor (public userEmails: IUsersEmails) {
    Object.assign(this, userEmails)
  }

  getUserEmail (): IUsersEmails {
    return this.userEmails
  }
}
