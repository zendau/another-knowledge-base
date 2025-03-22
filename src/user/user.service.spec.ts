import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entiries/user.entity';

describe('UserService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
