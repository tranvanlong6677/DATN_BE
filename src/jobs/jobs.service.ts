/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { isBefore } from 'date-fns';
import {
  User,
  UserDocument,
} from 'src/users/schemas/user.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}
  isJobExpired(expiryDate) {
    const currentDate = new Date();
    return isBefore(new Date(expiryDate), currentDate);
  }
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
    const currentDate = new Date();
    const { filter, population } = aqp(qs);
    let { sort } = aqp(qs);
    const defaultLimit = +limit ? +limit : 10;
    const offset = (+currentPage - 1) * defaultLimit;
    delete filter.current;
    delete filter.pageSize;

    const totalItems = (
      await this.jobModel.find({
        ...filter,
        endDate: { $gte: currentDate },
      })
    ).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }

    const result = await this.jobModel
      .find({ ...filter, endDate: { $gte: currentDate } })
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

  async findJobByCompany(
    currentPage: string,
    limit: string,
    qs: string,
    user: IUser,
  ) {
    console.log('>>> check user', user);
    const currentDate = new Date();
    const { filter, population } = aqp(qs);
    let { sort } = aqp(qs);
    const defaultLimit = +limit ? +limit : 10;
    const offset = (+currentPage - 1) * defaultLimit;
    delete filter.current;
    delete filter.pageSize;
    const dataUserFull = await this.userModel.findOne({
      _id: user?._id,
    });
    console.log(
      '>>> check data full',
      dataUserFull?.company?._id,
    );
    const companyId = dataUserFull?.company?._id;
    const totalItems = (
      await this.jobModel.find({
        ...filter,
        endDate: { $gte: currentDate },
        'company._id': companyId,
      })
    ).length;

    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = '-updatedAt';
    }

    const result = await this.jobModel
      .find({
        ...filter,
        endDate: { $gte: currentDate },
        'company._id': companyId,
      })
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    console.log('>>> check result', result, totalItems);
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

  async findJobBySkillsAndLocation(
    skills: string[],
    location: string[],
    level: string,
    salary: string,
    query: string,
  ) {
    // let { sort } = aqp(query);
    // const defaultLimit = +limit ? +limit : 10;
    // const offset = (+currentPage - 1) * defaultLimit;
    // delete filter.current;
    // delete filter.pageSize;
    const currentDate = new Date();
    const { filter, population } = aqp(query);
    const { current, pageSize } = filter;

    const offset = (+current - 1) * +pageSize;
    let minSalary = 0;
    let maxSalary = 0;

    if (salary === '0') {
      minSalary = 0;
      maxSalary = 5000000;
    }
    if (salary === '1') {
      minSalary = 5000000;
      maxSalary = 10000000;
    }
    if (salary === '2') {
      minSalary = 10000000;
      maxSalary = 15000000;
    }
    if (salary === '3') {
      minSalary = 1500000;
      maxSalary = 20000000;
    }
    if (salary === '4') {
      minSalary = 20000000;
      maxSalary = 25000000;
    }
    if (salary === '5') {
      minSalary = 25000001;
      maxSalary = 1000000000;
    }
    const totalItemsSearch =
      salary === '-1'
        ? (
            await this.jobModel.find({
              skills: { $in: skills },
              location: { $in: location },
              level: level,
              endDate: { $gte: currentDate },
              // salary: salary,
            })
          ).length
        : (
            await this.jobModel.find({
              skills: { $in: skills },
              location: { $in: location },
              level: level,
              salary: { $gte: minSalary, $lte: maxSalary },
              endDate: { $gte: currentDate },
            })
          ).length;
    const result =
      salary === '-1'
        ? await this.jobModel
            .find({
              skills: { $in: skills },
              location: { $in: location },
              level: level,
              endDate: { $gte: currentDate },
            })
            .limit(pageSize)
            .skip(offset)
        : await this.jobModel
            .find({
              skills: { $in: skills },
              location: { $in: location },
              level: level,
              salary: { $gte: minSalary, $lte: maxSalary },
              endDate: { $gte: currentDate },
            })
            .limit(pageSize)
            .skip(offset);

    return {
      meta: {
        current: +current, //trang hiện tại
        pageSize: +pageSize, //số lượng bản ghi đã lấy
        pages: Math.ceil(totalItemsSearch / +pageSize), //tổng số trang với điều kiện query
        total: totalItemsSearch, // tổng số phần tử (số bản ghi)
      },
      result: result && result.length > 0 ? result : [],
    };
  }

  async getJobByCompany() {
    return 'aaa';
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
