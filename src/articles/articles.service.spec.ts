import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { UsersService } from '@/user/user.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Tag } from './entities/tag.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { User } from '@/user/entiries/user.entity';

const mockArticleRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockTagRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserService = {
  findById: jest.fn(),
};

const createQueryBuilderMock = () => {
  const qb: Partial<SelectQueryBuilder<Article>> = {
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };
  return qb as SelectQueryBuilder<Article>;
};

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleRepo: jest.Mocked<Repository<Article>>;
  let tagRepo: jest.Mocked<Repository<Tag>>;
  let userService: jest.Mocked<UsersService>;
  let qb: SelectQueryBuilder<Article>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        { provide: getRepositoryToken(Tag), useValue: mockTagRepository },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleRepo = module.get(getRepositoryToken(Article));
    tagRepo = module.get(getRepositoryToken(Tag));
    userService = module.get(UsersService);

    qb = createQueryBuilderMock();

    jest.spyOn(articleRepo, 'createQueryBuilder').mockReturnValue(qb);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create an article', async () => {
      const articleDto = {
        title: 'Test',
        content: 'Content',
        isPublic: true,
        tags: ['Tech'],
      };
      const mockUser = {
        id: 1,
        email: 'user@example.com',
      } as User;

      const mockArticle = {
        ...articleDto,
        id: 1,
        author: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as undefined as Article;

      userService.findById.mockResolvedValue(mockUser);

      const existingTagEntity = { id: 100, name: 'nestjs' };
      (tagRepo.find as jest.Mock).mockResolvedValue([existingTagEntity]);

      const newTagEntity = { name: 'newtag' };

      (tagRepo.create as jest.Mock).mockReturnValue([newTagEntity]);
      (tagRepo.save as jest.Mock).mockResolvedValue([
        { id: 101, name: 'newtag' },
      ]);

      articleRepo.create.mockReturnValue(mockArticle);
      articleRepo.save.mockResolvedValue(mockArticle);

      const result = await service.create(articleDto, mockUser.id);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(
        service.create(
          { title: 'Test', content: 'Content', isPublic: true },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return an article', async () => {
      const articleData = { id: 1, title: 'Test', isPublic: true };

      (qb.getOne as jest.Mock).mockResolvedValue(articleData);
      const result = await service.findOne(1, true);
      expect(result).toEqual(articleData);
    });

    it('should throw NotFoundException if article not found', async () => {
      (articleRepo.createQueryBuilder().getOne as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(service.findOne(1, true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const mockArticle = { id: 1, title: 'Old Title', author: { id: 1 } };
      (qb.getOne as jest.Mock).mockResolvedValue(mockArticle);

      articleRepo.save.mockResolvedValue({
        ...mockArticle,
        title: 'New Title',
      } as Article);

      const result = await service.update(1, 1, { title: 'New Title' });
      expect(result.title).toEqual('New Title');
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const mockArticle = { id: 1, title: 'Test', author: { id: 2 } };
      (qb.getOne as jest.Mock).mockResolvedValue(mockArticle);
      await expect(service.update(1, 1, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      const mockArticle = { id: 1, author: { id: 1 } } as Article;
      (qb.getOne as jest.Mock).mockResolvedValue(mockArticle);
      articleRepo.remove.mockResolvedValue(mockArticle);

      await expect(service.remove(1, 1)).resolves.not.toThrow();
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const mockArticle = { id: 1, author: { id: 2 } };
      (qb.getOne as jest.Mock).mockResolvedValue(mockArticle);
      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findList', () => {
    it('should return a paginated list of articles', async () => {
      (qb.getMany as jest.Mock).mockResolvedValue([{ id: 1, title: 'Test' }]);
      const result = await service.findList({
        isAuth: true,
        pagination: { page: 1, limit: 10 },
        filter: {},
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });
});
