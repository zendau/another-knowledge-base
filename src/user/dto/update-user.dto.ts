import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum } from 'class-validator';
import { UserRole } from '../entiries/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(UserRole)
  role?: UserRole;
}
