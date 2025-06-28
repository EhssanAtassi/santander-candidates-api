import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Candidate } from '../candidates/entities/candidate.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'candidates.db',
  entities: [Candidate],
  synchronize: process.env.DATABASE_SYNC === 'true' || process.env.NODE_ENV !== 'production',
  logging: process.env.DATABASE_LOGGING === 'true' || process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
};
