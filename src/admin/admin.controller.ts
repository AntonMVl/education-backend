import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @Roles('admin', 'superadmin')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('users')
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users/:id')
  @Roles('admin', 'superadmin')
  findOneUser(@Param('id') id: string) {
    return this.adminService.findOneUser(+id);
  }

  @Patch('users/:id')
  @Roles('admin', 'superadmin')
  @UsePipes(new ValidationPipe())
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const currentUserId = req.user.id;
    return this.adminService.updateUser(+id, updateUserDto, currentUserId);
  }

  @Delete('users/:id')
  @Roles('admin', 'superadmin')
  removeUser(@Param('id') id: string, @Request() req: any) {
    const currentUserId = req.user.id;
    return this.adminService.removeUser(+id, currentUserId);
  }

  @Patch('users/:id/status')
  @Roles('admin', 'superadmin')
  toggleUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.toggleUserStatus(+id, body.status);
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  getStats() {
    return this.adminService.getStats();
  }
}
