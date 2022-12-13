import { Kafka } from 'kafkajs'
import { DATA_SOURCES } from '../config/vars.config'
export class KafkaService {
  dataSources = DATA_SOURCES.kafkaSources

  kafka = new Kafka({
    clientId: this.dataSources.CLIENT_ID,
    brokers: [this.dataSources.BROKERS],
    sasl: { username: this.dataSources.USERNAME_SASL, password: this.dataSources.KAFKA_PASSWORD_SASL, mechanism: 'plain' },
    ssl: this.dataSources.SSL
  })

  consumer = this.kafka.consumer({ groupId: this.dataSources.GROUP_ID })

  async sockectKafkaConsumer (valueTopic: string, cb: any) {
    try {
      await this.consumer.connect()
      await this.consumer.subscribe({ topic: valueTopic, fromBeginning: true })
      this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const msgToString = message.value?.toString().valueOf()
            if (!msgToString) return
            const msg = JSON.parse(msgToString)
            if (typeof msg !== 'object') return
            cb({ cm: this.consumer, data: msg })
          } catch (e: any) {
            if (e) {
              this.consumer.pause([{ topic: valueTopic }])
              setTimeout(() => this.consumer.resume([{ topic: valueTopic }]), e.retryAfter * 1000)
            }
            throw e
          }
        }
      }).then(() => cb({ cm: this.consumer, data: null }))
    } catch (error) {
      console.log('[ERROR_CONSUMER_RUN]: ', error)
    }
  }

  async closeSocket () {
    await this.consumer.disconnect()
  }
}
