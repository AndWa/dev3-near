import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'staging', 'production'),
  PORT: Joi.number(),
  DATABASE_URL: Joi.string().required(),
  COOKIE_NAME: Joi.string().required(),
  COOKIE_PASS: Joi.string().required(),
  ADMIN_JS_EMAIL: Joi.string().required(),
  ADMIN_JS_PASS: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  GITHUB_TOKEN: Joi.string().required(),
  GITHUB_WEBHOOK_SECRET: Joi.string().required(),
  START_CRON_JOBS: Joi.string(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
});
