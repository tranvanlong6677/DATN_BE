import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './shema/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}
  async create(createJobDto: CreateJobDto, user: IUser) {
    const result = await this.jobModel.create({
      ...createJobDto,
      isActive: true,
      createdBy: user._id,
    });
    return { _id: result._id, createdAt: result.startDate };
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
    delete filter.current;
    delete filter.pageSize;

    const totalItems = (await this.jobModel.find(filter))
      .length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }
    const result = await this.jobModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
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
    const result = await this.jobModel.findOne({ _id: id });
    return result;
  }

  async update(
    id: string,
    updateJobDto: UpdateJobDto,
    userId: string,
  ) {
    const result = await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: new mongoose.Types.ObjectId(userId),
      },
    );
    return result;
  }

  async remove(id: string, userId: string) {
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: new mongoose.Types.ObjectId(userId),
      },
    );
    const result = await this.jobModel.softDelete({
      _id: id,
    });
    return result;
  }
}
