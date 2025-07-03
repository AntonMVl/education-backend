import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserProgresService } from './user-progres.service';

@Controller('user-progress')
@UseGuards(JwtAuthGuard)
export class UserProgresController {
  constructor(private readonly userProgresService: UserProgresService) {}

  @Get('courses')
  async getAvailableCourses(@Request() req) {
    return this.userProgresService.getAvailableCourses(req.user.id);
  }

  @Get('course/:courseId')
  async getCourseProgress(@Request() req, @Param('courseId') courseId: string) {
    return this.userProgresService.getCourseProgress(req.user.id, courseId);
  }

  @Get('overall')
  async getOverallProgress(@Request() req) {
    return this.userProgresService.getOverallProgress(req.user.id);
  }

  @Post('lecture/:lectureId/complete')
  async completeLecture(
    @Request() req,
    @Param('lectureId') lectureId: string,
    @Body() body: { score?: number },
  ) {
    return this.userProgresService.completeLecture(
      req.user.id,
      lectureId,
      body.score,
    );
  }

  @Get('lecture/:lectureId/available')
  async isLectureAvailable(
    @Request() req,
    @Param('lectureId') lectureId: string,
  ) {
    return this.userProgresService.isLectureAvailable(req.user.id, lectureId);
  }
}
