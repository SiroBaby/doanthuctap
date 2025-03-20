import { Test, TestingModule } from '@nestjs/testing';
import { CartProductResolver } from './cart-product.resolver';
import { CartProductService } from './cart-product.service';

describe('CartProductResolver', () => {
  let resolver: CartProductResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartProductResolver, CartProductService],
    }).compile();

    resolver = module.get<CartProductResolver>(CartProductResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
