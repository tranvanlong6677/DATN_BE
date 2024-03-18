import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { JwtStrategy } from 'src/auth/passport/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new User")
  create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage("Fetch user with paginate")
  @UseGuards(JwtStrategy)
  fetchUserPaginate(@Query("current") currentPage: string, @Query("pageSize") limit: string, @Query() qs: string) {
    return this.usersService.fetchUser(currentPage, limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Fetch user by id")
  findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id)
    return user;
  }

  @Patch()
  @ResponseMessage("Update a User")
  @UseGuards(JwtStrategy)
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtStrategy)
  @ResponseMessage("Delete a User")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
