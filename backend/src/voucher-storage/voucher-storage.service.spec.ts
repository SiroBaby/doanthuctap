import { Test, TestingModule } from '@nestjs/testing';
import { VoucherStorageService } from './voucher-storage.service';

describe('VoucherStorageService', () => {
  let service: VoucherStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoucherStorageService],
    }).compile();

    service = module.get<VoucherStorageService>(VoucherStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
