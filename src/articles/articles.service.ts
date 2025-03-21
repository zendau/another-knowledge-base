import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { title, content, isPublic, tags } = createArticleDto;
    const articleTagsEntities: Tag[] = [];

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
    });

    return this.articleRepository.save(article);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Article[]> {
    return this.articleRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['tags'], // Добавляем связи, чтобы подтянуть теги
    });
  }

  async findOne(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!article) {
      throw new NotFoundException(`Статья с ID ${id} не найдена`);
    }

    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findOne(id);
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
    const article = await this.findOne(id);
    await this.articleRepository.remove(article);
  }

  async findByTags(tags: string[]): Promise<Article[]> {
    return this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .where('tag.name IN (:...tags)', { tags })
      .getMany();
  }
}
