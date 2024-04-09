import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { LocalStrategy } from './passport/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import ms from 'ms';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema,
} from 'src/users/schemas/user.schema';
import {
  Role,
  RoleSchema,
} from 'src/roles/schemas/role.schema';
import { RolesService } from 'src/roles/roles.service';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_ACCESS_TOKEN_SECRET',
        ),
        signOptions: {
          expiresIn:
            ms(
              configService.get<string>(
                'JWT_ACCESS_TOKEN_EXPIRES',
              ),
            ) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
