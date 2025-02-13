import { Test, TestingModule } from '@nestjs/testing';
import { ShopAddressService } from './shop-address.service';

describe('ShopAddressService', () => {
  let service: ShopAddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopAddressService],
    }).compile();

    service = module.get<ShopAddressService>(ShopAddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
