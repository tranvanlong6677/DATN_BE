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
const cloudinary = require('cloudinary').v2;

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
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
  ) {
    const resultUploadCloud =
      await cloudinary.uploader.upload(
        `${join(
          process.cwd(),
          `public/images/resume/${file.filename}`,
        )}`,
        {
          public_id: `${file.filename
            .split('.')
            .slice(0, -1)
            .join('.')}`,
          folder: 'resumes',
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
      'resume',
      `${file.filename}`,
    );
    fs.unlinkSync(filePath);
    await this.resumeModel.updateOne(
      { userId: user._id, jobId: body.jobId },
      { url: resultUploadCloud?.url },
    );
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
