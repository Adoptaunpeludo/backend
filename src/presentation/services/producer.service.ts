import { Channel } from 'amqplib';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';

export class ProducerService {
  private channelWrapper: ChannelWrapper;
  private EXCHANGE: string;

  constructor(private readonly rabbitmqUrl: string) {
    this.EXCHANGE = 'email-request';
    const connection = amqp.connect(this.rabbitmqUrl);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        // return channel.assertQueue(queue, { durable: true });
        return channel.assertExchange(this.EXCHANGE, 'direct', {
          durable: true,
        });
      },
    });
  }

  async addToEmailQueue(payload: any, queue: string) {
    try {
      // await this.channelWrapper.sendToQueue(
      //   queue,
      //   Buffer.from(JSON.stringify(payload)),
      //   { persistent: true }
      // );
      await this.channelWrapper.publish(
        this.EXCHANGE,
        queue,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true }
      );

      console.log('Email sent to queue');
    } catch (error) {
      console.log('Error sending email to queue', error);
    }
  }
}
