import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class DashboardStat {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}

@ObjectType()
export class SellerDashboardStats {
  @Field(() => Float, { description: 'Tổng doanh thu' })
  totalRevenue: number;

  @Field(() => Int, { description: 'Số lượng đơn hàng' })
  orderCount: number;

  @Field(() => Int, { description: 'Số lượng sản phẩm' })
  productCount: number;

  @Field(() => Float, { description: 'Điểm đánh giá trung bình' })
  averageRating: number;

  @Field(() => [MonthlyRevenue], { description: 'Doanh thu theo tháng', nullable: true })
  monthlyRevenue?: MonthlyRevenue[];

  @Field(() => [ProductStatus], { description: 'Số lượng sản phẩm theo trạng thái', nullable: true })
  productStatusCount?: ProductStatus[];
}

@ObjectType()
export class MonthlyRevenue {
  @Field(() => String, { description: 'Tháng (MM/YYYY)' })
  month: string;

  @Field(() => Float, { description: 'Doanh thu' })
  revenue: number;
}

@ObjectType()
export class ProductStatus {
  @Field(() => String, { description: 'Trạng thái sản phẩm' })
  status: string;

  @Field(() => Int, { description: 'Số lượng' })
  count: number;
}
