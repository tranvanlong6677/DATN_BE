import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import ms from 'ms';
import { Response } from 'express';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService, @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
        private configService: ConfigService,
        @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
        private rolesService: RolesService) { }
    async validateUser(username: string, pass: string): Promise<any> {
        const user = (await this.usersService.findOneByUsername(username));
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if (isValid) {
                const userRole = (user.role as unknown) as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id)
                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }
                return objUser
            }
        }
        return null;
    }
    async login(user: IUser, response: Response) {
        const { _id, name, email, role, permissions } = user
        const payload = {
            sub: 'token login', iss: "from server",
            _id, name, email, role
        };

        const refreshToken = this.createRefreshToken(payload)
        await this.usersService.updateUserToken(refreshToken, _id)
        response.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRES")) })
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id, name, email, role, permissions

            }
        };
    }

    async register(registerUserDto: RegisterUserDto) {
        const { name, email, password, address, gender, age } = registerUserDto
        const isExist = await this.userModel.findOne({ email })
        if (isExist) {
            throw new BadRequestException(`Email ${email} đã tồn tại`)
        }

        const userRole = await this.roleModel.findOne({ name: USER_ROLE })
        const result = (await this.userModel.create({ name, email, role: userRole?._id, age, gender, address, password: this.usersService.hashPassword(password) })).toObject()
        console.log(result)
        return result
    }

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRES")) / 1000
        })
        return refreshToken
    }


    refreshToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            })

            let user = await this.usersService.getUserByToken(refreshToken)
            console.log("user", user)
            if (user) {
                const { _id, name, email, role } = user
                const payload = {
                    sub: 'token refresh', iss: "from server",
                    _id, name, email, role
                };

                const refreshToken = this.createRefreshToken(payload)
                await this.usersService.updateUserToken(refreshToken, _id.toString())
                response.clearCookie("refresh_token")
                response.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRES")) })
                // const userRole = await this.rolesService.findOne({ role._id.toString() })
                const userRole = user.role as unknown as { _id: string, name: string }
                const temp = await this.rolesService.findOne(userRole._id)
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id, name, email, role,
                        permissions: temp?.permissions ?? []
                    }

                };
            } else {
                throw new BadRequestException("Refresh token không hợp lệ, vui lòng đăng nhập lại!!!")
            }
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ, vui lòng đăng nhập lại!!!")
        }
    }

    logout = async (user: IUser, response: Response) => {
        response.clearCookie("refresh_token")
        await this.userModel.updateOne({ _id: user._id }, { refreshToken: "" })
        return 'logout ok'
    }
}
