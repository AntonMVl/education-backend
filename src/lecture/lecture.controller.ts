import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/roles.enum';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { LectureService } from './lecture.service';

@Controller('lecture')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  create(@Body() createLectureDto: CreateLectureDto) {
    return this.lectureService.create(createLectureDto);
  }

  @Get()
  findAll() {
    return this.lectureService.findAll();
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.lectureService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lectureService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() updateLectureDto: UpdateLectureDto) {
    return this.lectureService.update(id, updateLectureDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.lectureService.remove(id);
  }

  @Post(':id/pdf')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('pdf'))
  async addPdf(@Param('id') id: string, @UploadedFile() file: any) {
    const pdfPath = `/uploads/lectures/${file.filename}`;
    return this.lectureService.addPdf(id, pdfPath);
  }

  @Post(':id/image')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async addImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('altText') altText?: string,
  ) {
    const imagePath = `/uploads/lectures/${file.filename}`;
    return this.lectureService.addImage(id, imagePath, altText);
  }
}
