import { IsIn, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(3, { message: 'login must be more then 3 symbols' })
  login: string;

  @IsString()
  @IsIn(['user', 'admin', 'superadmin'], {
    message: 'Role must be one of: user, admin, superadmin',
  })
  role: string;

  @IsString()
  city: string;
}
