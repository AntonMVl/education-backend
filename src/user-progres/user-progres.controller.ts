import { Controller } from '@nestjs/common';
import { UserProgresService } from './user-progres.service';

@Controller('user-progres')
export class UserProgresController {
  constructor(private readonly userProgresService: UserProgresService) {}
}
