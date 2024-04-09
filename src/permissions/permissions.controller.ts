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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
  Public,
  ResponseMessage,
  User,
} from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @ResponseMessage('Create a permission')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User() user: IUser,
  ) {
    return this.permissionsService.create(
      createPermissionDto,
      user,
    );
  }

  @Get()
  @ResponseMessage('Fetch permission list paginate')
  fetchAllPaginate(
    @Query('pageSize') pageSize: string,
    @Query('current') current: string,
    @Query() qs: string,
  ) {
    return this.permissionsService.fetchAllPaginate(
      pageSize,
      current,
      qs,
    );
  }

  @Get(':id')
  @ResponseMessage('Fetch a permission by id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a permission')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @User() user: IUser,
  ) {
    return this.permissionsService.update(
      id,
      updatePermissionDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Delete a permission')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(id, user);
  }
}
