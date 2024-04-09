import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const newDate = new Date();
    const checkDuplicateName = await this.roleModel.findOne(
      { name: createRoleDto.name },
    );

    if (checkDuplicateName) {
      throw new BadRequestException(
        'Trùng tên role đã tạo',
      );
    } else {
      return await this.roleModel.create({
        ...createRoleDto,
        createdAt: newDate,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });
    }
  }

  async fetchRolePaginate(
    limit: string,
    currentPage: string,
    qs: string,
  ) {
    const { filter, population, projection } = aqp(qs);
    let { sort } = aqp(qs);
    const defaultLimit = +limit ? +limit : 10;
    const offset = (+currentPage - 1) * defaultLimit;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = (await this.roleModel.find(filter))
      .length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }
    const result = await this.roleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection as any)
      .exec();
    return {
      meta: {
        current: +currentPage, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found');
    }
    return await this.roleModel
      .findOne({ _id: id })
      .populate({
        path: 'permissions',
        select: {
          _id: 1,
          apiPath: 1,
          name: 1,
          method: 1,
          module: 1,
        },
      });
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found');
    }
    const newDate = new Date();

    return await this.roleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedAt: newDate,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException(
        'Không thể xóa role admin',
      );
    }
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.roleModel.softDelete({ _id: id });
  }
}
