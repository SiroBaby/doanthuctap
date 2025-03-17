import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DashboardStatsService } from './dashboard-stats.service';
import { DashboardStat, SellerDashboardStats } from './entities/dashboard-stat.entity';
import { CreateDashboardStatInput } from './dto/create-dashboard-stat.input';
import { UpdateDashboardStatInput } from './dto/update-dashboard-stat.input';

@Resolver(() => DashboardStat)
export class DashboardStatsResolver {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Mutation(() => DashboardStat)
  createDashboardStat(@Args('createDashboardStatInput') createDashboardStatInput: CreateDashboardStatInput) {
    return this.dashboardStatsService.create(createDashboardStatInput);
  }

  @Query(() => [DashboardStat], { name: 'dashboardStats' })
  findAll() {
    return this.dashboardStatsService.findAll();
  }

  @Query(() => DashboardStat, { name: 'dashboardStat' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.dashboardStatsService.findOne(id);
  }

  @Mutation(() => DashboardStat)
  updateDashboardStat(@Args('updateDashboardStatInput') updateDashboardStatInput: UpdateDashboardStatInput) {
    return this.dashboardStatsService.update(updateDashboardStatInput.id, updateDashboardStatInput);
  }

  @Mutation(() => DashboardStat)
  removeDashboardStat(@Args('id', { type: () => Int }) id: number) {
    return this.dashboardStatsService.remove(id);
  }

  @Query(() => SellerDashboardStats, { name: 'getSellerDashboardStats' })
  getSellerDashboardStats(@Args('shopId', { type: () => String }) shopId: string) {
    return this.dashboardStatsService.getSellerDashboardStats(shopId);
  }
}
