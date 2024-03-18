import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty({ message: "Name khong duoc de trong" })
    name: string;

    @IsNotEmpty({ message: "Address khong duoc de trong" })
    address: string;

    @IsNotEmpty({ message: "Description khong duoc de trong" })
    description: string;

    @IsNotEmpty({ message: "Logo khong duoc de trong" })
    logo: string;
}

