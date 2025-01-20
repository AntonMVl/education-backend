import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(5, { message: 'login must be more then 5 symbols' })
  login: string;

  @IsString()
  role: string;

  @IsString()
  city: string;
}
