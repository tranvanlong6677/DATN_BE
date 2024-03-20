import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Permission,
  PermissionDocument,
} from './schemas/permission.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
    user: IUser,
  ) {
    const newDate = new Date();
    const checkDuplicate =
      await this.permissionModel.findOne({
        apiPath: createPermissionDto.apiPath,
        method: createPermissionDto.method,
      });

    if (checkDuplicate) {
      throw new BadRequestException(
        'API đã tồn tại trong permission',
      );
    }
    const result = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
      createdAt: newDate,
    });

    return {
      _id: result._id,
      createdAt: newDate,
    };
  }

  async fetchAllPaginate(
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

    const totalItems = (
      await this.permissionModel.find(filter)
    ).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }
    const result = await this.permissionModel
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

    return await this.permissionModel.findOne({ _id: id });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    const newDate = new Date();
    return await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedAt: newDate,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found');
    }
    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.permissionModel.softDelete({
      _id: id,
    });
  }
}
