import { IsArray, IsEnum } from 'class-validator';
import { Permission } from '../../enums/permissions.enum';

export class UpdateAdminPermissionsDto {
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}
