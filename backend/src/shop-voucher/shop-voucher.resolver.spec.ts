import { Test, TestingModule } from '@nestjs/testing';
import { ShopVoucherResolver } from './shop-voucher.resolver';
import { ShopVoucherService } from './shop-voucher.service';

describe('ShopVoucherResolver', () => {
  let resolver: ShopVoucherResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopVoucherResolver, ShopVoucherService],
    }).compile();

    resolver = module.get<ShopVoucherResolver>(ShopVoucherResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
