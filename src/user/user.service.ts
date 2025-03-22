import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entiries/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email'],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(
    targetUserId: number,
    currentUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    if (targetUserId !== currentUserId) {
      throw new ForbiddenException(
        "Unauthorized action. You do not have permission to update another user's data. Ensure the user ID matches your authenticated account.",
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUsers = await this.userRepository.save(user);

    return updatedUsers;
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`User with id - ${id} not found`);
    }

    return Boolean(result.affected);
  }
}
