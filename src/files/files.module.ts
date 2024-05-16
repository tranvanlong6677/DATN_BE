/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Resume,
  ResumeSchema,
} from 'src/resumes/schema/resume.schema';
import {
  Company,
  CompanySchema,
} from 'src/companies/schema/company.schema';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
    ]),
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
