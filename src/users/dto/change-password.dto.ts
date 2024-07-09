import {
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  @MinLength(8, {
    message: 'Mật khẩu mới phải có ít nhất 8 ký tự.',
  })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).*$/, {
    message:
      'Mật khẩu mới phải chứa ít nhất một chữ cái và một số.',
  })
  newPassword: string;
}
