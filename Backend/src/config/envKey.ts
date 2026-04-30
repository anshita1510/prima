import dotenv from 'dotenv';

dotenv.config();

export const envKey= {
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    // jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
}