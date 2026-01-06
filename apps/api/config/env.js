import 'dotenv/config'; 
export const ENV = {
  PORT: process.env.PORT || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_DAYS: process.env.JWT_EXPIRES_DAYS,
  COOKIE_NAME: process.env.COOKIE_NAME,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  

  
  
};
