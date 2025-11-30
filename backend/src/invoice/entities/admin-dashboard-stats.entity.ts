import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Product } from '../../product/entities/product.entity';
import { Shop } from '../../shop/entities/shop.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
class OrderStats {
  @Field(() => Int)
  waiting_for_delivery: number;

  @Field(() => Int)
  processed: number;

  @Field(() => Int)
  delivery: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Int)
  canceled: number;
}

@ObjectType()
class RevenueByMonth {
  @Field(() => String)
  month: string;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
class TopSellingProduct {
  @Field(() => Int)
  product_id: number;

  @Field(() => String)
  product_name: string;

  @Field(() => Int)
  total_quantity: number;

  @Field(() => Float)
  total_revenue: number;

  @Field(() => Product)
  product: Product;
}

@ObjectType()
class TopShop {
  @Field(() => String)
  shop_id: string;

  @Field(() => String)
  shop_name: string;

  @Field(() => Float)
  total_revenue: number;

  @Field(() => Int)
  total_orders: number;

  @Field(() => Int)
  total_products: number;

  @Field(() => Shop)
  shop: Shop;
}

@ObjectType()
class RecentOrder {
  @Field(() => String)
  invoice_id: string;

  @Field(() => String)
  order_status: string;

  @Field(() => Float)
  total_amount: number;

  @Field(() => User)
  user: User;

  @Field(() => Shop)
  shop: Shop;
}

@ObjectType()
export class AdminDashboardStats {
  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  totalShops: number;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => OrderStats)
  orderStats: OrderStats;

  @Field(() => [RevenueByMonth])
  revenueByMonth: RevenueByMonth[];

  @Field(() => [TopSellingProduct])
  topSellingProducts: TopSellingProduct[];

  @Field(() => [TopShop])
  topShops: TopShop[];

  @Field(() => [RecentOrder])
  recentOrders: RecentOrder[];
} 