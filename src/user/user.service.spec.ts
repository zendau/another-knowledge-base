import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entiries/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: '123456',
      };
      const mockUser = { id: 1, ...dto } as User;

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await usersService.create(dto);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findById(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['id', 'email'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await usersService.findById(99);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await usersService.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return user if authorized', async () => {
      const mockUser = { id: 1, email: 'test@example.com' } as User;
      const updateDto: UpdateUserDto = { email: 'new@example.com' };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, ...updateDto });

      const result = await usersService.update(1, 1, updateDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...updateDto,
      });
      expect(result).toEqual({ ...mockUser, ...updateDto });
    });

    it('should throw ForbiddenException if user tries to update another user', async () => {
      await expect(usersService.update(2, 1, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(usersService.update(1, 1, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete user and return true', async () => {
      userRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await usersService.remove(1);

      expect(userRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(usersService.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
