import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password must be more then 6 symbols' })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'login must be more then 3 symbols' })
  login?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin', 'superadmin'], {
    message: 'Role must be one of: user, admin, superadmin',
  })
  role?: string;
}
