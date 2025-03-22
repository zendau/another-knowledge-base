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

  // @UseGuards(OptionalAuthGuard)
  // @Get('tags')
  // findByTags(@Request() req, @Query('tags') tags: string[]) {
  //   const isAuth = Boolean(req.user);

  //   console.log(tags);

  //   return this.articlesService.findByTags(tags, isAuth);
  // }

  @UseGuards(OptionalAuthGuard)
  @Get()
  findAll(
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
  findOne(@Request() req, @Param('id') id: string) {
    const isAuth = Boolean(req.user);

    return this.articlesService.findOne(+id, isAuth);
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
