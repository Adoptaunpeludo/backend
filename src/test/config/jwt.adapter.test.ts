import { JWTAdapter, JWTAdapterPayload } from '../../config/jwt.adapter';
import JWT from 'jsonwebtoken';

describe('jwt.adapter.ts', () => {
  const jwt = new JWTAdapter('secret');
  const payload: JWTAdapterPayload = {
    user: { id: '1', name: 'test', email: 'test@test.com', role: 'admin' },
  };
  let token: string | null;

  test('should return a token with correct payload', async () => {
    token = await jwt.generateToken(payload);

    expect(token).toStrictEqual(expect.any(String));
  });

  test('should return correct payload', async () => {
    const decodedToken = await jwt.validateToken(token!);

    expect(decodedToken).toEqual(expect.objectContaining(payload));
  });

  // test('should return an error ', async () => {
  //   JWT.verify = jest
  //     .fn()
  //     .mockImplementationOnce((_, __, callback) =>
  //       callback(new Error('Simulated error'))
  //     );

  //   JWT.sign = jest
  //     .fn()
  //     .mockImplementationOnce((_, __, {}, callback) =>
  //       callback(new Error('Simulated error'))
  //     );

  //   const token = jwt.generateToken(payload);
  //   const decodedToken = jwt.validateToken('invalidToken');

  //   expect(decodedToken).toBe(null);
  //   expect(token).toBe(null);
  // });
});
