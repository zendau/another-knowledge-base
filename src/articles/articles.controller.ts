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
  ParseArrayPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from './dto/pagitaion.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '@/auth/guards/optional-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findList(
    @Request() req,
    @Query() { page, limit }: PaginationDto,
    @Query('tags', new ParseArrayPipe({ items: String, optional: true }))
    tags?: string[],
  ) {
    const isAuth = Boolean(req.user);

    return this.articlesService.findList({
      isAuth,
      pagination: { page, limit },
      filter: { tags },
    });
  }

  @UseGuards(OptionalAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const isAuth = Boolean(req.user);

    return this.articlesService.findOne(id, isAuth);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) articleId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const userId = req.user?.id;

    return this.articlesService.update(articleId, userId, updateArticleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) articleId: number) {
    const userId = req.user?.id;

    return this.articlesService.remove(articleId, userId);
  }
}
