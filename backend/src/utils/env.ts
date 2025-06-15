// backend/src/utils/env.ts

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const env = {
  FRONTEND_URL: getEnv('FRONTEND_URL'),
  EMAIL_USER: getEnv('GOOGLE_USER'),
  EMAIL_PASS: getEnv('GOOGLE_APP_PASSWORD'),
};