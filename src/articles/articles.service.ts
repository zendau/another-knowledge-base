import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { Repository, In } from 'typeorm';
import { UsersService } from '@/user/user.service';
import IFindList from './interfaces/IFindList';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    private readonly userService: UsersService,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    authorId: number,
  ): Promise<Article> {
    const { title, content, isPublic, tags } = createArticleDto;
    const articleTagsEntities: Tag[] = [];

    const user = await this.userService.findById(authorId);

    if (!user) throw new NotFoundException('Author not found');

    if (tags) {
      const tagEntities = await this.tagRepository.find({
        where: { name: In(tags) },
      });
      articleTagsEntities.push(...tagEntities);

      const existingTagNames = tagEntities.map((tag) => tag.name);
      const newTags = tags.filter((tag) => !existingTagNames.includes(tag));

      if (newTags.length > 0) {
        const newTagEntities = this.tagRepository.create(
          newTags.map((name) => ({ name })),
        );
        articleTagsEntities.push(...newTagEntities);
        await this.tagRepository.save(newTagEntities);
      }
    }

    const article = this.articleRepository.create({
      title,
      content,
      isPublic,
      tags: articleTagsEntities,
      author: user,
    });

    return this.articleRepository.save(article);
  }

  async findList({ isAuth, pagination: { page, limit }, filter }: IFindList) {
    const query = this.queryBuilder().orderBy('article.createdAt');

    if (filter.tags) {
      query.andWhere('tags.name IN (:...tags)', {
        tags: filter.tags,
      });
    }

    if (!isAuth) {
      query.andWhere('article.isPublic = :isPublic', { isPublic: true });
    }

    query.take(limit).skip((page - 1) * limit);

    const list = await query.getMany();
    const hasNextPage = limit - list.length === 0;

    return {
      data: list,
      meta: {
        page,
        limit,
        hasNextPage,
      },
    };
  }

  async findOne(id: number, isAuth: boolean): Promise<Article> {
    const query = this.queryBuilder().where('article.id = :id', { id });

    if (!isAuth) {
      query.andWhere('article.isPublic = :isPublic', { isPublic: true });
    }

    const article = await query.getOne();
    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }

    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(id, true);
    Object.assign(article, updateArticleDto);

    if (updateArticleDto.tags) {
      const tagEntities = await this.tagRepository.find({
        where: { name: In(updateArticleDto.tags) },
      });

      const existingTagNames = tagEntities.map((tag) => tag.name);
      const newTags = updateArticleDto.tags.filter(
        (tag) => !existingTagNames.includes(tag),
      );

      const newTagEntities = this.tagRepository.create(
        newTags.map((name) => ({ name })),
      );

      await this.tagRepository.save(newTagEntities);
      article.tags = [...tagEntities, ...newTagEntities];
    }

    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    const article = await this.findOne(id, true);
    await this.articleRepository.remove(article);
  }

  queryBuilder() {
    return this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.title',
        'article.content',
        'article.isPublic',
        'article.createdAt',
        'article.updatedAt',
      ])
      .innerJoin('article.author', 'author')
      .addSelect(['author.id', 'author.email'])
      .leftJoinAndSelect('article.tags', 'tags');
  }
}
