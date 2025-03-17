import { Test, TestingModule } from '@nestjs/testing';
import { DashboardStatsService } from './dashboard-stats.service';

describe('DashboardStatsService', () => {
  let service: DashboardStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardStatsService],
    }).compile();

    service = module.get<DashboardStatsService>(DashboardStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
