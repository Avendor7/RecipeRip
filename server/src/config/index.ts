import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = parseInt(process.env.PORT || '3000', 10);
export const PROJECT_ROOT: string = process.cwd();
export const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    // Add additional Redis configurations if needed
};
