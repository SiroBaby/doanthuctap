import { Test, TestingModule } from '@nestjs/testing';
import { VoucherStorageResolver } from './voucher-storage.resolver';
import { VoucherStorageService } from './voucher-storage.service';

describe('VoucherStorageResolver', () => {
  let resolver: VoucherStorageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoucherStorageResolver, VoucherStorageService],
    }).compile();

    resolver = module.get<VoucherStorageResolver>(VoucherStorageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
