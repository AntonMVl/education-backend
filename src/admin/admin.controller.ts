import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from '../enums/permissions.enum';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AdminService } from './admin.service';
import { UpdateAdminPermissionsDto } from './dto/update-admin-permissions.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findOneUser(id);
  }

  @Post('users')
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.adminService.createUser(createUserDto, req.user.id);
  }

  @Patch('users/:id')
  @UsePipes(new ValidationPipe())
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.adminService.updateUser(id, updateUserDto, req.user.id);
  }

  @Delete('users/:id')
  removeUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.removeUser(id, req.user.id);
  }

  @Patch('users/:id/status')
  toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserStatus(id);
  }

  // Новые эндпоинты для работы с администраторами
  @Get('admins')
  getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get('admins/:id/permissions')
  getAdminPermissions(@Param('id', ParseIntPipe) adminId: number) {
    return this.adminService.getAdminPermissions(adminId);
  }

  @Patch('admins/:id/permissions')
  updateAdminPermissions(
    @Param('id', ParseIntPipe) adminId: number,
    @Body() updateDto: UpdateAdminPermissionsDto,
    @Request() req,
  ) {
    return this.adminService.updateAdminPermissions(
      adminId,
      updateDto,
      req.user.id,
    );
  }

  @Get('permissions/check/:permission')
  async checkPermission(
    @Param('permission') permission: string,
    @Request() req,
  ) {
    // Проверяем, что permission является валидным значением enum
    if (!Object.values(Permission).includes(permission as Permission)) {
      return { hasPermission: false };
    }
    const hasPermission = await this.adminService.checkPermission(
      req.user.id,
      permission as Permission,
    );
    return { hasPermission };
  }

  @Get('permissions/my')
  async getMyPermissions(@Request() req) {
    return this.adminService.getUserPermissions(req.user.id);
  }

  @Get('users/:id/progress')
  async getUserProgress(@Param('id', ParseIntPipe) userId: number) {
    const progress = await this.adminService.getUserProgress(userId);
    return { progress };
  }
}
