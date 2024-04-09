import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from './schema/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(
    createSubscriberDto: CreateSubscriberDto,
    user: IUser,
  ) {
    const isExist = await this.subscriberModel.findOne({
      email: createSubscriberDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        'Email này đã được thêm trong danh sách Subcribers',
      );
    }
    const newDate = new Date();
    const result = await this.subscriberModel.create({
      ...createSubscriberDto,
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

  async getUserSkills(user: IUser) {
    const result = await this.subscriberModel.findOne(
      { email: user.email },
      { skills: 1 },
    );
    return result;
  }

  async findAll(
    currentPage: string,
    limit: string,
    qs: string,
  ) {
    const { filter, population } = aqp(qs);
    let { sort } = aqp(qs);
    const defaultLimit = +limit ? +limit : 10;
    const offset = (+currentPage - 1) * defaultLimit;
    delete filter.pageSize;
    delete filter.current;

    const totalItems = (
      await this.subscriberModel.find(filter)
    ).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }
    const result = await this.subscriberModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select('-password')
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
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
      return 'Not valid';
    }
    return await this.subscriberModel.findOne({ _id: id });
  }

  async update(
    updateSubscriberDto: UpdateSubscriberDto,
    user: IUser,
  ) {
    return await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { upsert: true }, // nếu bản ghi subscriber đã tồn tại thì update, còn chưa tồn tại thì insert
    );
    //
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found');
    }
    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.subscriberModel.softDelete({
      _id: id,
    });
  }
}
