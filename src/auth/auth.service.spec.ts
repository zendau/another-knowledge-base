import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entiries/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockedAccessToken'),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(10), // SALT_ROUNDS = 10
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  describe('register', () => {
    it('should create a user and return access token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      usersService.findByEmail.mockResolvedValue(null); // Пользователь не найден
      usersService.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await authService.register({
        email: 'test@example.com',
        password: '123456',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(result).toEqual({ accessToken: 'mockedAccessToken' });
    });

    it('should throw BadRequestException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 1 } as User);

      await expect(
        authService.register({ email: 'test@example.com', password: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access token if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login('test@example.com', '123456');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedPassword');
      expect(result).toEqual({ accessToken: 'mockedAccessToken' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('test@example.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
