import { Test, TestingModule } from '@nestjs/testing';
import { ShopVoucherService } from './shop-voucher.service';

describe('ShopVoucherService', () => {
  let service: ShopVoucherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopVoucherService],
    }).compile();

    service = module.get<ShopVoucherService>(ShopVoucherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
