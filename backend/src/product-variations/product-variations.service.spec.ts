import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariationsService } from './product-variations.service';

describe('ProductVariationsService', () => {
  let service: ProductVariationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationsService],
    }).compile();

    service = module.get<ProductVariationsService>(ProductVariationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
