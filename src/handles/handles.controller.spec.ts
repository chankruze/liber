import { Test, TestingModule } from '@nestjs/testing';
import { HandlesController } from './handles.controller';
import { HandlesService } from './handles.service';

describe('HandlesController', () => {
  let controller: HandlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HandlesController],
      providers: [HandlesService],
    }).compile();

    controller = module.get<HandlesController>(HandlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
