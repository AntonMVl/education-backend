import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { IUser } from 'src/types/types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(login: string, password: string) {
    const user = await this.userService.findOne(login);
    if (!user) throw new NotFoundException('User bu this login is not found');

    const passwordIsMatch = await argon2.verify(user.password, password);

    if (!passwordIsMatch)
      throw new UnauthorizedException('Password is incorrect');
    if (user && passwordIsMatch) {
      return user;
    }
    return null;
  }

  async login(user: IUser) {
    const { password, createdAt, ...safeUser } = user;
    return {
      user: safeUser,
      token: this.jwtService.sign({
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        role: user.role,
      }),
    };
  }
}
