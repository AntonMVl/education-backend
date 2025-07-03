import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProgresModule } from '../user-progres/user-progres.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminPermission } from './entities/admin-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AdminPermission]), UserProgresModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
