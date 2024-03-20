import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import mongoose from 'mongoose';
import { Company } from 'src/companies/schema/company.schema';

export class UpdateUserDtoByAdmin {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  role: mongoose.Schema.Types.ObjectId;

  // @IsNotEmpty()
  company: Company;
}

export class UpdateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  age: number;

  @IsNotEmpty()
  gender: string;

  @IsNotEmpty()
  address: string;
}
