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
  MAIL_SERVICE: get('MAIL_SERVICE').required().asString(),
  MAILER_EMAIL: get('MAILER_EMAIL').required().asString(),
  MAILER_SECRET_KEY: get('MAILER_SECRET_KEY').required().asString(),

  //*
  WEBSERVICE_URL: get('WEBSERVICE_URL').required().asString(),

  //* RABBITMQ
  RABBITMQ_USER: get('RABBITMQ_USER').required().asString(),
  RABBITMQ_PASS: get('RABBITMQ_PASS').required().asString(),
  RABBITMQ_URL: get('RABBITMQ_URL').required().asString(),
};
