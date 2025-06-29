import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: {
        login: createUserDto.login,
      },
    });
    if (existUser)
      throw new BadRequestException('User by this login is already exist!');

    const plainPassword = crypto
      .randomBytes(10)
      .toString('base64')
      .slice(0, 10);

    const password = await argon2.hash(plainPassword);

    const user = await this.userRepository.save({
      ...createUserDto,
      password,
    });

    const token = this.jwtService.sign({ login: createUserDto.login });

    return {
      message: 'User successfully created',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        login: user.login,
        role: user.role,
        city: user.city,
      },
      plainPassword,
      token,
    };
  }

  async findOne(login: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { login } });
  }

  async updateProfile(id: number | string, updateUserDto: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: { id: Number(id) },
    });
    if (!user) throw new BadRequestException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return user;
  }

  async resetPassword(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new BadRequestException('User not found');

    // Генерируем новый пароль
    const plainPassword = crypto
      .randomBytes(10)
      .toString('base64')
      .slice(0, 10);

    // Хешируем пароль
    const hashedPassword = await argon2.hash(plainPassword);

    // Обновляем пароль в базе данных
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      message: 'Password successfully reset',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        login: user.login,
        role: user.role,
        city: user.city,
      },
      plainPassword,
    };
  }

  //   findAll() {
  //     return `This action returns all user`;
  //   }

  //   findOne(id: number) {
  //     return `This action returns a #${id} user`;
  //   }

  //   update(id: number, updateUserDto: UpdateUserDto) {
  //     return `This action updates a #${id} user`;
  //   }

  //   remove(id: number) {
  //     return `This action removes a #${id} user`;
  //   }
}
