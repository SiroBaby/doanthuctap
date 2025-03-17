import { Test, TestingModule } from '@nestjs/testing';
import { DashboardStatsResolver } from './dashboard-stats.resolver';
import { DashboardStatsService } from './dashboard-stats.service';

describe('DashboardStatsResolver', () => {
  let resolver: DashboardStatsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardStatsResolver, DashboardStatsService],
    }).compile();

    resolver = module.get<DashboardStatsResolver>(DashboardStatsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
