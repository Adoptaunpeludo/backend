import { Channel } from 'amqplib';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';

export class ProducerService {
  private channelWrapper: ChannelWrapper;

  constructor(
    private readonly rabbitmqUrl: string,
    private readonly queue: string
  ) {
    const connection = amqp.connect(this.rabbitmqUrl);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue(queue, { durable: true });
      },
    });
  }

  async addToEmailQueue(payload: any) {
    try {
      await this.channelWrapper.sendToQueue(
        this.queue,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );

      console.log('Email sent to queue');
    } catch (error) {
      console.log('Error sending email to queue', error);
    }
  }
}
