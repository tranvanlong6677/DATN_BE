/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  ResponseMessage,
  User,
  Public,
} from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Get data company success!')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.companiesService.fetchPaginate(
      +currentPage,
      +limit,
      qs,
    );
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get data company by id')
  async getDataCompanyById(@Param('id') id: string) {
    return await this.companiesService.findOne(id);
  }

  @Post()
  @ResponseMessage('Create company successfully')
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @User() user: IUser,
  ) {
    console.log(
      '>>> check createCompanyDto',
      createCompanyDto,
    );

    return this.companiesService.create(
      createCompanyDto,
      user,
    );
  }

  @Patch(':id')
  @ResponseMessage('Update company successfully')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    console.log(
      '>>> check updateCompanyDto controller',
      updateCompanyDto,
    );

    return this.companiesService.update(
      id,
      updateCompanyDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Delete company successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
