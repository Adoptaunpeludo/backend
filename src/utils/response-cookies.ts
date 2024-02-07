import { Response } from 'express';

interface Options {
  res: Response;
  accessToken: string;
  refreshToken: string;
}

export class AttachCookiesToResponse {
  static attach({ res, accessToken, refreshToken }: Options) {
    const oneMinute = 1000 * 60;
    const oneDay = 1000 * 60 * 60 * 24;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      expires: new Date(Date.now() + oneMinute),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === 'production',
      signed: true,
    });
  }
}
