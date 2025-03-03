import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariationsResolver } from './product-variations.resolver';
import { ProductVariationsService } from './product-variations.service';

describe('ProductVariationsResolver', () => {
  let resolver: ProductVariationsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationsResolver, ProductVariationsService],
    }).compile();

    resolver = module.get<ProductVariationsResolver>(ProductVariationsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
