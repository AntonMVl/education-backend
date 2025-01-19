import { Module } from '@nestjs/common';
import { UserProgresService } from './user-progres.service';
import { UserProgresController } from './user-progres.controller';

@Module({
  controllers: [UserProgresController],
  providers: [UserProgresService],
})
export class UserProgresModule {}
