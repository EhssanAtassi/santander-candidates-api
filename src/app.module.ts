import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';

import { CandidatesModule } from './candidates/candidates.module';
import { ExcelModule } from './excel/excel.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),

    CandidatesModule,

    ExcelModule,

    CommonModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
