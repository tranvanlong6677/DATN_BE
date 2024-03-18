import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schema/company.schema';


@Module({
  // Muốn dùng 1 model trong service thì cần import vào trong module
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: []
})
export class CompaniesModule { }
