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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  Public,
  ResponseMessage,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { SearchJobBody } from './dto/search-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create a new job')
  create(
    @Body() createJobDto: CreateJobDto,
    @User() user: IUser,
  ) {
    return this.jobsService.create(createJobDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('fetch job paginate')
  findAll(
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(current, pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Fetch a job by id')
  findOne(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.findOne(id);
  }

  @Post('/search-jobs')
  @Public()
  @ResponseMessage('Search jobs by skill and location')
  findJobBySkillsAndLocation(
    // @Param('id') id: string,
    @User() user: IUser,
    @Body() searchJobBody: SearchJobBody,
  ) {
    // return this.jobsService.findOne(id);
    console.log('>>> check search job', searchJobBody);
    return this.jobsService.findJobBySkillsAndLocation(
      searchJobBody.skills,
      searchJobBody.location,
      searchJobBody.level,
      searchJobBody.salary,
      searchJobBody.query,
    );
  }
  @Post('/company_id=?companyId')
  @Public()
  @ResponseMessage('Fetch jobs by company')
  fetchJobByCompanyId(
    // @Param('id') id: string,
    @User() user: IUser,
    @Query() companyId: string,
  ) {
    // return this.jobsService.findOne(id);
    console.log(
      '>>> check fetch job by company',
      companyId,
    );
    return this.jobsService.getJobByCompany();
  }

  @Patch(':id')
  @ResponseMessage('Update a job')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser,
  ) {
    return this.jobsService.update(
      id,
      updateJobDto,
      user._id,
    );
  }

  @Delete(':id')
  @ResponseMessage('Delete a job')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user._id);
  }
}
