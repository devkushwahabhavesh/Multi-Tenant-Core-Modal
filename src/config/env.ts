import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  appName: process.env.APP_NAME || 'Modular Express Mongo API',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/core_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'core_generic_backend_secret_jwt_key_32_characters_minimum',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;

