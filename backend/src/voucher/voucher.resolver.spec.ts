import { Test, TestingModule } from '@nestjs/testing';
import { VoucherResolver } from './voucher.resolver';
import { VoucherService } from './voucher.service';

describe('VoucherResolver', () => {
  let resolver: VoucherResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoucherResolver, VoucherService],
    }).compile();

    resolver = module.get<VoucherResolver>(VoucherResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
