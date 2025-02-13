import { Test, TestingModule } from '@nestjs/testing';
import { ShopAddressResolver } from './shop-address.resolver';
import { ShopAddressService } from './shop-address.service';

describe('ShopAddressResolver', () => {
  let resolver: ShopAddressResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopAddressResolver, ShopAddressService],
    }).compile();

    resolver = module.get<ShopAddressResolver>(ShopAddressResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
