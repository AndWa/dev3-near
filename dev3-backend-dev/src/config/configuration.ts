import { existsSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({
  path: existsSync(`.env.${process.env.NODE_ENV}`)
    ? `.env.${process.env.NODE_ENV}`
    : '.env',
});

export const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT || 3001,
  database_uri: process.env.DATABASE_URL,
  admin_js: {
    cookie_name: process.env.COOKIE_NAME,
    cookie_pass: process.env.COOKIE_PASS,
    admin_email: process.env.ADMIN_JS_EMAIL,
    admin_pass: process.env.ADMIN_JS_PASS,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
    webhook_secret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  aws: {
    access_key: process.env.AWS_ACCESS_KEY,
    secret_key: process.env.AWS_SECRET_KEY,
    bucket_name: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION,
  },
  start_cron_jobs: process.env.START_CRON_JOBS,
});
