import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/config/.dev.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: true,
  entities: [__dirname + '/modules/**/entities/**/*.ts'],
  migrations: [__dirname + '/migrations/**/*.ts'],
});
