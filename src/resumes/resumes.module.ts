import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Resume,
  ResumeSchema,
} from './schema/resume.schema';
import {
  User,
  UserSchema,
} from 'src/users/schemas/user.schema';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService],
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
export class ResumesModule {}
