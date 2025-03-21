import { Injectable } from '@nestjs/common';
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

  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email'],
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findBy({ id });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDto);
    const updatedUsers = await this.userRepository.save(user);

    return updatedUsers[0];
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findBy({ id });

    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
  }
}
