import mongoose from "mongoose";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateResumeDto {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId;
    
    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    status: string;

    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    jobId: mongoose.Schema.Types.ObjectId;

    // @IsNotEmpty()
    // history: historyResumeElement[];
}

export class CreatUserCvDto {
    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    @IsMongoId()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    jobId: mongoose.Schema.Types.ObjectId;


}
