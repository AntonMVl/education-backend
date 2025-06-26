import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Permission, PermissionDisplayNames } from '../enums/permissions.enum';
import { Role } from '../enums/roles.enum';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { User } from '../user/entities/user.entity';
import { UpdateAdminPermissionsDto } from './dto/update-admin-permissions.dto';
import { AdminPermission } from './entities/admin-permission.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AdminPermission)
    private readonly adminPermissionRepository: Repository<AdminPermission>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: ['creator'],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        login: true,
        role: true,
        city: true,
        createdAt: true,
        createdBy: true,
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          login: true,
        },
      },
      order: {
        role: 'ASC',
        id: 'ASC',
      },
    });

    // Убираем пароли из результата
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result as User;
    });
  }

  async findOneUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['creator'],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        login: true,
        role: true,
        city: true,
        createdAt: true,
        createdBy: true,
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          login: true,
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Возвращаем пользователя без пароля
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as User;
  }

  async createUser(
    createUserDto: CreateUserDto,
    currentUserId: number,
  ): Promise<{ user: User; plainPassword: string }> {
    console.log('createUser called with:', { createUserDto, currentUserId });

    // Получаем текущего пользователя
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new BadRequestException('Текущий пользователь не найден');
    }

    // Проверяем права на создание пользователей
    if (currentUser.role === Role.SUPERADMIN) {
      // Суперадмин может создавать любых пользователей
    } else if (currentUser.role === Role.ADMIN) {
      // Админ может создавать только пользователей с ролью USER
      if (createUserDto.role === Role.ADMIN) {
        // Если админ пытается создать админа, проверяем право MANAGE_ADMINS
        if (!this.hasPermission(currentUser, Permission.MANAGE_ADMINS)) {
          throw new ForbiddenException(
            'У вас нет прав на создание администраторов',
          );
        }
      } else if (createUserDto.role === Role.USER) {
        // Если админ создает обычного пользователя, проверяем право CREATE_USERS
        if (!this.hasPermission(currentUser, Permission.CREATE_USERS)) {
          throw new ForbiddenException(
            'У вас нет прав на создание пользователей',
          );
        }
      } else if (createUserDto.role === Role.SUPERADMIN) {
        throw new ForbiddenException(
          'Администраторы не могут создавать суперадминистраторов',
        );
      }
    } else {
      throw new ForbiddenException('У вас нет прав на создание пользователей');
    }

    // Проверяем, существует ли пользователь с таким логином
    const existingUser = await this.userRepository.findOne({
      where: { login: createUserDto.login },
    });
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким логином уже существует',
      );
    }

    // Генерируем пароль
    const plainPassword = crypto
      .randomBytes(10)
      .toString('base64')
      .slice(0, 10);
    const hashedPassword = await argon2.hash(plainPassword);

    // Создаем пользователя
    const user = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
      createdBy: currentUserId,
    });

    // Возвращаем пользователя без пароля
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword as User,
      plainPassword,
    };
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId: number,
  ): Promise<User> {
    console.log('updateUser called with:', {
      id,
      updateUserDto,
      currentUserId,
    });

    // Получаем текущего пользователя
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new BadRequestException('Текущий пользователь не найден');
    }

    const userToUpdate = await this.findOneUser(id);
    if (!userToUpdate) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Защита суперадмина от изменений
    if (
      userToUpdate.role === Role.SUPERADMIN &&
      currentUser.role !== Role.SUPERADMIN
    ) {
      throw new ForbiddenException('Нельзя изменять суперадминистратора');
    }

    // Проверяем права на обновление
    if (currentUser.role === Role.SUPERADMIN) {
      // Суперадмин может обновлять любых пользователей
    } else if (currentUser.role === Role.ADMIN) {
      // Админ не может изменять свои права
      if (userToUpdate.id === currentUser.id && updateUserDto.permissions) {
        throw new ForbiddenException('Вы не можете изменять свои права');
      }

      if (userToUpdate.role === Role.ADMIN) {
        // Если обновляем админа, проверяем право MANAGE_ADMINS
        if (!this.hasPermission(currentUser, Permission.MANAGE_ADMINS)) {
          throw new ForbiddenException(
            'У вас нет прав на редактирование администраторов',
          );
        }
      } else if (userToUpdate.role === Role.USER) {
        // Если обновляем обычного пользователя, проверяем право EDIT_USERS
        if (!this.hasPermission(currentUser, Permission.EDIT_USERS)) {
          throw new ForbiddenException(
            'У вас нет прав на редактирование пользователей',
          );
        }
      }

      // Проверяем, не пытается ли админ изменить роль на суперадмин
      if (updateUserDto.role === Role.SUPERADMIN) {
        throw new ForbiddenException(
          'Администраторы не могут назначать роль суперадминистратора',
        );
      }
    } else {
      throw new ForbiddenException(
        'У вас нет прав на редактирование пользователей',
      );
    }

    // Очищаем объект от undefined значений
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined),
    );

    await this.userRepository.update(id, cleanUpdateData);
    return this.findOneUser(id);
  }

  async removeUser(id: number, currentUserId: number): Promise<void> {
    // Получаем текущего пользователя
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new BadRequestException('Текущий пользователь не найден');
    }

    const userToDelete = await this.findOneUser(id);
    if (!userToDelete) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Защита суперадмина от удаления
    if (userToDelete.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Нельзя удалить суперадминистратора');
    }

    // Защита от удаления самого себя
    if (userToDelete.id === currentUser.id) {
      throw new ForbiddenException('Вы не можете удалить свой аккаунт');
    }

    // Проверяем права на удаление
    if (currentUser.role === Role.SUPERADMIN) {
      // Суперадмин может удалять любых пользователей (кроме суперадминов)
    } else if (currentUser.role === Role.ADMIN) {
      if (userToDelete.role === Role.ADMIN) {
        // Если удаляем админа, проверяем право MANAGE_ADMINS
        if (!this.hasPermission(currentUser, Permission.MANAGE_ADMINS)) {
          throw new ForbiddenException(
            'У вас нет прав на удаление администраторов',
          );
        }
      } else if (userToDelete.role === Role.USER) {
        // Если удаляем обычного пользователя, проверяем право DELETE_USERS
        if (!this.hasPermission(currentUser, Permission.DELETE_USERS)) {
          throw new ForbiddenException(
            'У вас нет прав на удаление пользователей',
          );
        }
      }
    } else {
      throw new ForbiddenException('У вас нет прав на удаление пользователей');
    }

    await this.userRepository.remove(userToDelete);
  }

  async toggleUserStatus(id: number): Promise<User> {
    const user = await this.findOneUser(id);
    // Логика переключения статуса пользователя
    return user;
  }

  async getStats(): Promise<any> {
    const [totalUsers, totalAdmins, totalSuperadmins] = await Promise.all([
      this.userRepository.count({ where: { role: Role.USER } }),
      this.userRepository.count({ where: { role: Role.ADMIN } }),
      this.userRepository.count({ where: { role: Role.SUPERADMIN } }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalSuperadmins,
      totalUsersCount: totalUsers + totalAdmins + totalSuperadmins,
    };
  }

  async getAllAdmins() {
    const admins = await this.userRepository.find({
      where: { role: Role.ADMIN },
      relations: ['creator'],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        login: true,
        role: true,
        city: true,
        createdAt: true,
        createdBy: true,
        creator: {
          id: true,
          firstName: true,
          lastName: true,
          login: true,
        },
      },
      order: {
        id: 'ASC',
      },
    });

    // Убираем пароли из результата
    return admins.map((admin) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = admin;
      return result as User;
    });
  }

  async getAdminPermissions(adminId: number) {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        login: true,
        role: true,
        permissions: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Администратор не найден');
    }

    if (admin.role !== Role.ADMIN) {
      throw new BadRequestException('Пользователь не является администратором');
    }

    return {
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        login: admin.login,
        role: admin.role,
      },
      permissions: admin.permissions || [],
      availablePermissions: Object.values(Permission).map((permission) => ({
        value: permission,
        label: PermissionDisplayNames[permission],
      })),
    };
  }

  async updateAdminPermissions(
    adminId: number,
    updateDto: UpdateAdminPermissionsDto,
    currentUserId: number,
  ) {
    // Получаем текущего пользователя
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      throw new BadRequestException('Текущий пользователь не найден');
    }

    const userToUpdate = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!userToUpdate) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Защита суперадмина от изменений прав
    if (
      userToUpdate.role === Role.SUPERADMIN &&
      currentUser.role !== Role.SUPERADMIN
    ) {
      throw new ForbiddenException('Нельзя изменять права суперадминистратора');
    }

    // Проверяем права на управление правами
    if (currentUser.role === Role.SUPERADMIN) {
      // Суперадмин может изменять права любых пользователей
    } else if (currentUser.role === Role.ADMIN) {
      // Админ не может изменять свои права
      if (userToUpdate.id === currentUser.id) {
        throw new ForbiddenException('Вы не можете изменять свои права');
      }

      // Админ может изменять права только если у него есть право MANAGE_ADMIN_PERMISSIONS
      if (
        !this.hasPermission(currentUser, Permission.MANAGE_ADMIN_PERMISSIONS)
      ) {
        throw new ForbiddenException(
          'У вас нет прав на управление правами администраторов',
        );
      }

      // Админ может изменять права только других админов
      if (userToUpdate.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Можно изменять права только администраторов',
        );
      }
    } else {
      throw new ForbiddenException('У вас нет прав на управление правами');
    }

    // Если предоставляется право MANAGE_ADMINS, автоматически добавляем права на управление пользователями
    let finalPermissions = updateDto.permissions;
    if (updateDto.permissions.includes(Permission.MANAGE_ADMINS)) {
      finalPermissions = [
        ...updateDto.permissions,
        Permission.CREATE_USERS,
        Permission.EDIT_USERS,
        Permission.DELETE_USERS,
      ];
      // Убираем дубликаты
      finalPermissions = [...new Set(finalPermissions)];
    }

    await this.userRepository.update(adminId, {
      permissions: finalPermissions,
    });

    return this.getAdminPermissions(adminId);
  }

  async checkPermission(
    userId: number,
    permission: Permission,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        permissions: true,
      },
    });

    if (!user) {
      return false;
    }

    // Суперадмин имеет все права
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Проверяем конкретное право
    return user.permissions?.includes(permission) || false;
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        permissions: true,
      },
    });

    if (!user) {
      return [];
    }

    // Суперадмин имеет все права
    if (user.role === Role.SUPERADMIN) {
      return Object.values(Permission);
    }

    return user.permissions || [];
  }

  async getUsers(currentUser: User) {
    // Суперадмин видит всех пользователей
    if (currentUser.role === Role.SUPERADMIN) {
      return this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    // Админ видит только пользователей с ролью user и admin
    if (currentUser.role === Role.ADMIN) {
      return this.userRepository.find({
        where: [{ role: Role.USER }, { role: Role.ADMIN }],
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }

  async getAdmins(currentUser: User) {
    // Суперадмин видит всех админов
    if (currentUser.role === Role.SUPERADMIN) {
      return this.userRepository.find({
        where: { role: Role.ADMIN },
        order: { createdAt: 'DESC' },
      });
    }

    // Админ видит других админов только если у него есть право MANAGE_ADMINS
    if (
      currentUser.role === Role.ADMIN &&
      this.hasPermission(currentUser, Permission.MANAGE_ADMINS)
    ) {
      return this.userRepository.find({
        where: { role: Role.ADMIN },
        order: { createdAt: 'DESC' },
      });
    }

    return [];
  }

  private hasPermission(user: User, permission: Permission): boolean {
    return user.permissions?.includes(permission) || false;
  }

  // Метод для автоматического предоставления прав на управление пользователями
  // при предоставлении права на управление админами
  async grantAdminManagementPermissions(userId: number, currentUser: User) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (user.role !== Role.ADMIN) {
      throw new BadRequestException(
        'Права на управление админами можно предоставить только администраторам',
      );
    }

    // Добавляем права на управление админами и автоматически права на управление пользователями
    const newPermissions = [
      ...(user.permissions || []),
      Permission.MANAGE_ADMINS,
      Permission.CREATE_USERS,
      Permission.EDIT_USERS,
      Permission.DELETE_USERS,
    ];

    // Убираем дубликаты
    const uniquePermissions = [...new Set(newPermissions)];

    await this.userRepository.update(userId, {
      permissions: uniquePermissions,
    });
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
