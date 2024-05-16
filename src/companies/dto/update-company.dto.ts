import { IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto {
  @IsNotEmpty({ message: 'Name khong duoc de trong' })
  name: string;

  @IsNotEmpty({ message: 'Address khong duoc de trong' })
  address: string;

  @IsNotEmpty({
    message: 'Description khong duoc de trong',
  })
  description: string;
}
