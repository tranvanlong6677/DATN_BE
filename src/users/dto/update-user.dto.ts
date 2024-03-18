import { IsEmail } from 'class-validator';
import mongoose from 'mongoose';
import { Company } from 'src/companies/schema/company.schema';

export class UpdateUserDto {
    name: string

    @IsEmail()
    email: string

    age: number

    gender: string

    address: string

    role: mongoose.Schema.Types.ObjectId

    company: Company

} 
