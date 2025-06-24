import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      order: { id: 'ASC' },
    });

    // Возвращаем пользователей без паролей
    return users.map((user) => {
      const { password, ...result } = user;
      return result as User;
    });
  }

  async findOneUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Возвращаем пользователя без пароля
    const { password, ...result } = user;
    return result as User;
  }

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<{ user: User; plainPassword: string }> {
    const { login, firstName, lastName, role, city } = createUserDto;

    // Проверяем, существует ли пользователь с таким логином
    const existingUser = await this.userRepository.findOne({
      where: { login },
    });
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким логином уже существует',
      );
    }

    // Генерируем временный пароль
    const plainPassword = crypto
      .randomBytes(8)
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8);

    // Хешируем пароль с помощью argon2
    const hashedPassword = await argon2.hash(plainPassword);

    // Создаем нового пользователя
    const user = this.userRepository.create({
      login,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      city,
    });

    const savedUser = await this.userRepository.save(user);

    // Возвращаем пользователя без пароля и временный пароль
    const { password: _, ...result } = savedUser;
    return {
      user: result as User,
      plainPassword,
    };
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId: number,
  ): Promise<User> {
    // Пользователь не может редактировать сам себя через админку
    if (id === currentUserId) {
      throw new BadRequestException(
        'Вы не можете редактировать свой собственный аккаунт через админку. Используйте личный кабинет.',
      );
    }

    const user = await this.findOneUser(id);

    // Если обновляется логин, проверяем уникальность
    if (updateUserDto.login && updateUserDto.login !== user.login) {
      const existingUser = await this.userRepository.findOne({
        where: { login: updateUserDto.login },
      });
      if (existingUser) {
        throw new BadRequestException(
          'Пользователь с таким логином уже существует',
        );
      }
    }

    // Если обновляется пароль, хешируем его
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    // Обновляем пользователя
    await this.userRepository.update(id, updateUserDto);

    // Возвращаем обновленного пользователя
    const updatedUser = await this.findOneUser(id);
    const { password: _, ...result } = updatedUser;
    return result as User;
  }

  async removeUser(id: number, currentUserId: number): Promise<void> {
    // Пользователь не может удалить сам себя
    if (id === currentUserId) {
      throw new BadRequestException(
        'Вы не можете удалить свой собственный аккаунт',
      );
    }

    const user = await this.findOneUser(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.userRepository.remove(user);
  }

  async toggleUserStatus(id: number, status: string): Promise<User> {
    const user = await this.findOneUser(id);

    // Здесь можно добавить логику для статуса пользователя
    // Пока просто возвращаем пользователя
    return user;
  }

  async getStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return {
      totalUsers,
      usersByRole,
      // Можно добавить другие статистики
    };
  }
}
