import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Permission } from '../../enums/permissions.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password must be more then 6 symbols' })
  password?: string;

  @IsOptional()
  @IsArray()
  permissions?: Permission[];
}
