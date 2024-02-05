import crypto from 'crypto';

type BufferEncoding = 'hex';

export class CryptoAdapter {
  static randomBytes(number: number, type: BufferEncoding) {
    return crypto.randomBytes(number).toString(type);
  }
}
