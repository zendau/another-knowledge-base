import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import RoleGuard from '@/auth/guards/roles.guard';
import { UserRole } from './entiries/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateUserDto,
  ) {
    const userId = req.user?.id;

    return this.userService.update(id, userId, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard(UserRole.ADMIN))
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
