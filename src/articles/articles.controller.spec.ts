import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { UsersService } from '@/user/user.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
        {
          // Мок для ArticleRepository
          provide: getRepositoryToken(Article),
          useValue: {}, // Здесь можно задать stub-реализацию методов репозитория
        },
        {
          // Мок для TagRepository
          provide: getRepositoryToken(Tag),
          useValue: {},
        },
        {
          // Мок для UsersService, если ArticlesService его использует
          provide: UsersService,
          useValue: {
            // Можно добавить stub-методы, если необходимо
          },
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
