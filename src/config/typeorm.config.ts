import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  // type: 'sqlite',
  // database: process.env.DATABASE_PATH || 'candidates.db',

  type: 'postgres',

  url: process.env.DATABASE_URL,
  entities: [Candidate],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
};
