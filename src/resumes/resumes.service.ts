import { Injectable } from '@nestjs/common';
import { CreatUserCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schema/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>) { }

  async create(creatUserCvDto: CreatUserCvDto, user: IUser) {
    const newId = new mongoose.Types.ObjectId()
    const newDate = new Date()
    await this.resumeModel.create({
      _id: newId,
      email: user.email, userId: user._id, status: "PENDING", history: [{
        status: "PENDING", updatedAt: newDate, updatedBy: {
          _id: user._id,
          email: user.email
        }
      }],
      ...creatUserCvDto
    })
    return {
      _id: newId,
      createdAt: newDate
    };
  }

  async findAll(currentPage: string, limit: string, qs: string) {
    const { filter, population, projection } = aqp(qs);
    let { sort } = aqp(qs)
    const defaultLimit = +limit ? +limit : 10
    const offset = (+currentPage - 1) * defaultLimit
    delete filter.current;
    delete filter.pageSize;


    const totalItems = (await this.resumeModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit)
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sort = "-updatedAt"
    }
    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection as any)
      .exec()
    return {
      meta: {
        current: +currentPage, //trang hiện tại
        pageSize: defaultLimit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    return await this.resumeModel.findOne({ _id: id });
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    const resumeCurrent = await this.resumeModel.findOne({ _id: id })
    const newDate = new Date()
    const result = await this.resumeModel.updateOne({ _id: id }, {
      status: updateResumeDto.status,
      updatedBy: {
        _id: user._id,
        email: user.email
      }, history: [...resumeCurrent.history, {
        status: updateResumeDto.status,
        updatedAt: newDate,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }]
    })
    return result;
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.resumeModel.softDelete({ _id: id })
  }

  async getCvByUser(userId: string) {
    const result = await this.resumeModel.find({ userId }).sort("-createdAt").populate([{ path: "companyId", select: { name: 1 } }, { path: "jobId", select: { name: 1 } }])
    console.log("result", result)
    return result
  }
}
