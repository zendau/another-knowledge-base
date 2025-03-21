import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from './dto/pagitaion.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { OptionalAuthGuard } from '@/auth/optional-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto, req.user.sub);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    const isAuth = Boolean(req.user);

    return this.articlesService.findAll(
      isAuth,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(+id, updateArticleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}
