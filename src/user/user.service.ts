import { BadRequestException, Injectable } from '@nestjs/common';
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
    };
  }

  async findOne(login: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { login } });
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
