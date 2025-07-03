import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestService } from './test.service';

@Controller('test')
@UseGuards(JwtAuthGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('lecture/:lectureId/questions')
  async getRandomQuestions(@Param('lectureId') lectureId: string) {
    return await this.testService.getRandomQuestions(lectureId);
  }

  @Post('lecture/:lectureId/check')
  async checkAnswers(
    @Param('lectureId') lectureId: string,
    @Body() body: { answers: Array<{ questionId: string; answerId: string }> },
  ) {
    return await this.testService.checkAnswers(lectureId, body.answers);
  }
}
