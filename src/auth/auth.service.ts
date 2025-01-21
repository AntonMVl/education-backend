import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(login: string, password: string) {
    const user = await this.userService.findOne(login);
    if (!user) throw new NotFoundException('User bu this login is not found');

    const passwordIsMatch = await argon2.verify(user.password, password);

    if (!passwordIsMatch)
      throw new BadRequestException('Password is incorrect');
    if (user && passwordIsMatch) {
      return {
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          login: user.login,
          role: user.role,
          city: user.city,
        },
      };
    }
    return null;
  }
}
