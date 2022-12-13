import 'dotenv/config'

export const DATA_SOURCES = {
  mySqlDataSource: {
    DB_HOST: process.env.MY_SQL_DB_HOST,
    DB_USER: process.env.MY_SQL_DB_USER,
    DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD,
    DB_PORT: Number(process.env.MY_SQL_DB_PORT),
    DB_DATABASE: process.env.MY_SQL_DB_DATABASE,
    DB_CONNECTION_LIMIT: process.env.MY_SQL_DB_CONNECTION_LIMIT ? parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT) : 4
  },
  kafkaSources: {
    CLIENT_ID: process.env.KAFKA_CLIENT_ID,
    BROKERS: process.env.KAFKA_BROKERS ?? '',
    SSL: true,
    USERNAME_SASL: process.env.KAFKA_USERNAME_SASL ?? '',
    KAFKA_PASSWORD_SASL: process.env.KAFKA_PASSWORD_SASL ?? '',
    topics: () => {
      return String(process.env.KAFKA_TOPICS)?.split(',')
    },
    GROUP_ID: process.env.KAFKA_GROUP_ID ?? ''
  },
  DEFAULT_PROPS: {
    ID_PAIS: 13,
    ID_IDIOMA: 1,
    DOCUMENTS_TYPES: 'DNI',
    CLIENT_NAME: String(process.env.CLIENT_NAME),
    TIMEZONE: String(process.env.TIMEZONE),
    DEFAULT_IMAGE_CAMADA: String(process.env.DEFAULT_IMAGE_CAMADA),
    DEFAULT_ID_CAMADA: Number(process.env.DEFAULT_ID_CAMADA)
  },
  API_INFO: {
    URL_AUTH: String(process.env.URL_AUTH),
    BODY_AUTH: {
      client_id: 'lyncros',
      client_secret: 'lyncros-qa',
      grant_type: 'client_credentials',
      scope: 'studentRecords:read'
    },
    URL_STUDENT_RECORD: String(process.env.URL_STUDENT_RECORD)
  },
  cron: {
    START_CRON_TOPIC_EMPLOYEE: String(process.env.START_CRON_TOPIC_EMPLOYEE),
    START_CRON_TOPIC_CONTACT: String(process.env.START_CRON_TOPIC_CONTACT)
  },
  token: ''
}
