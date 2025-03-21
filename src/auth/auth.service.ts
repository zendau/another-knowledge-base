import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@/user/entiries/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Регистрация нового пользователя
  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = createUserDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRounds = this.configService.get<number>('SALT_ROUNDS') || 10;
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя с хешированным паролем
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    // Генерация JWT токена
    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  // Вход пользователя (аутентификация)
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Генерация JWT токена
    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  // Генерация токена
  private async generateAccessToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
