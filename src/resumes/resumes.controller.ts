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
import { ResumesService } from './resumes.service';
import {
  CreatUserCvDto,
  CreateResumeDto,
} from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import {
  ResponseMessage,
  User,
} from 'src/decorator/customize';

@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
  ) {}

  @Post()
  @ResponseMessage('Create a new resume')
  create(
    @Body() creatUserCvDto: CreatUserCvDto,
    @User() user: IUser,
  ) {
    return this.resumesService.create(creatUserCvDto, user);
  }

  @Get()
  @ResponseMessage('Fetch all resumes with paginate')
  findAll(
    @Query('pageSize') pageSize: string,
    @Query('current') current: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(
      current,
      pageSize,
      qs,
    );
  }

  @Get(':id')
  @ResponseMessage('Get resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a resume')
  update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @User() user: IUser,
  ) {
    return this.resumesService.update(
      id,
      updateResumeDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }

  @Post('by-user')
  @ResponseMessage('Get resumes by user')
  getCvByUser(@User() user: IUser) {
    return this.resumesService.getCvByUser(user._id);
  }
}
