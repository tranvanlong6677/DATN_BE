import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  exports: [RolesService],
})
export class RolesModule {}
