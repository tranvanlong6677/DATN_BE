import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './shema/job.schema';
import {
  User,
  UserSchema,
} from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { RolesModule } from 'src/roles/roles.module';
import {
  Role,
  RoleSchema,
} from 'src/roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    UsersModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, UsersService],
})
export class JobsModule {}
