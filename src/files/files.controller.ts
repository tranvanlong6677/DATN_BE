/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseFilters,
  Req,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Public,
  ResponseMessage,
  User,
} from 'src/decorator/customize';
import { HttpExceptionFilter } from 'src/core/http-exception.filter';
import path, { join } from 'path';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  Resume,
  ResumeDocument,
} from 'src/resumes/schema/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import * as fs from 'fs';
import { Request } from 'express';
import { Company } from 'src/companies/schema/company.schema';
const cloudinary = require('cloudinary').v2;

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,

    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  @Post('upload')
  @ResponseMessage('Upload file success')
  @UseInterceptors(FileInterceptor('fileUpload'))
  @UseFilters(new HttpExceptionFilter())
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            /(jpg|jpeg|png|image\/png|image\/jpeg|gif|txt|pdf|doc|docx|text\/plain)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024,
        })
        .build({
          errorHttpStatusCode:
            HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @User() user: IUser,
    @Body() body: any,
    @Req() req: Request,
  ) {
    console.log('body >>>>', JSON.stringify(body));

    const resultUploadCloud =
      await cloudinary.uploader.upload(
        `${join(
          process.cwd(),
          `public/images/${
            req.headers.folder_type === 'resume'
              ? 'resume'
              : req.headers.folder_type === 'company'
              ? 'company'
              : ''
          }/${file.filename}`,
        )}`,
        {
          public_id: `${file.filename
            .split('.')
            .slice(0, -1)
            .join('.')}`,
          folder: `${
            req.headers.folder_type === 'resume'
              ? 'resume'
              : req.headers.folder_type === 'company'
              ? 'company'
              : ''
          }`,
          resource_type: 'image',
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        function (error, result) {
          console.log('error', error);
        },
      );

    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'images',
      `${
        req.headers.folder_type === 'resume'
          ? 'resume'
          : req.headers.folder_type === 'company'
          ? 'company'
          : ''
      }`,
      `${file.filename}`,
    );
    fs.unlinkSync(filePath);
    if (req.headers.folder_type === 'resume') {
      await this.resumeModel.updateOne(
        { userId: user._id, jobId: body.jobId },
        { url: resultUploadCloud?.url },
      );
    }

    console.log(
      '>>> check resultUploadCloud',
      resultUploadCloud,
    );
    console.log('>>>fsbifbaisdf', resultUploadCloud?.url);
    if (req.headers.folder_type === 'company') {
      await this.companyModel.updateOne(
        { _id: body.companyId },
        { logo: resultUploadCloud?.url },
      );
    }
    return {
      fileName: file.filename,
      url: resultUploadCloud?.url,
    };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
