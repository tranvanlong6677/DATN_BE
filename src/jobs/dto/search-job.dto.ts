/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class SearchJobBody {
  @ArrayNotEmpty()
  skills: string[];

  @ArrayNotEmpty()
  location: string[];

  @IsNotEmpty()
  level: string;

  @IsNotEmpty()
  salary: string;

  @IsNotEmpty()
  query: string;
}
