import { Module } from '@nestjs/common';
import { DashboardStatsService } from './dashboard-stats.service';
import { DashboardStatsResolver } from './dashboard-stats.resolver';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [DashboardStatsResolver, DashboardStatsService, PrismaService],
})
export class DashboardStatsModule { }
