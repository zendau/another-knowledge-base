import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entiries/user.entity';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
