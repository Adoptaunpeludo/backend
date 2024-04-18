import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
  PORT: get('PORT').required().asPortNumber(),
  NODE_ENV: get('NODE_ENV').required().asString(),

  //* Database
  DB_PASSWORD: get('DB_PASSWORD').required().asString(),
  DB_NAME: get('DB_NAME').required().asString(),
  DB_HOST: get('DB_HOST').required().asString(),
  DB_PORT: get('DB_PORT').required().asPortNumber(),
  DB_USERNAME: get('DB_USERNAME').required().asString(),

  //* JWT
  JWT_SEED: get('JWT_SEED').required().asString(),

  //* Email Service
  MAIL_SERVICE: get('MAIL_SERVICE').asString(),
  MAILER_EMAIL: get('MAILER_EMAIL').asString(),
  MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').asString(),

  //*
  WEBSERVICE_URL: get('WEBSERVICE_URL').asString(),

  //* RABBITMQ
  RABBITMQ_USER: get('RABBITMQ_USER').required().asString(),
  RABBITMQ_PASS: get('RABBITMQ_PASS').required().asString(),
  RABBITMQ_URL: get('RABBITMQ_URL').required().asString(),

  //* AWS S3 BUCKET
  AWS_ACCESS_KEY_ID: get('AWS_ACCESS_KEY_ID').required().asString(),
  AWS_SECRET_ACCESS_KEY: get('AWS_SECRET_ACCESS_KEY').required().asString(),
  AWS_REGION: get('AWS_REGION').required().asString(),
  AWS_BUCKET: get('AWS_BUCKET').required().asString(),
  AWS_BUCKET_URL: get('AWS_BUCKET_URL').required().asString(),
};
