import { Channel } from 'amqplib';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';

export class ProducerService {
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly rabbitmqUrl: string,
    private readonly exchange: string
  ) {
    const connection = amqp.connect(this.rabbitmqUrl);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertExchange(exchange, 'direct', {
          durable: true,
        });
      },
    });
    console.log(`${this.exchange} exchange created`);
  }

  async addMessageToQueue(payload: any, queue: string) {
    try {
      await this.channelWrapper.publish(
        this.exchange,
        queue,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );

      console.log('Message sent to queue');
    } catch (error) {
      console.log('Error sending message to queue', error);
    }
  }
}
