import { Injectable } from '@nestjs/common';
import { CreateDashboardStatInput } from './dto/create-dashboard-stat.input';
import { UpdateDashboardStatInput } from './dto/update-dashboard-stat.input';
import { PrismaService } from 'src/prisma.service';
import { SellerDashboardStats, MonthlyRevenue, ProductStatus } from './entities/dashboard-stat.entity';

interface RevenueData {
  totalRevenue: string | null;
}

interface OrderCountData {
  orderCount: string | null;
}

interface RatingData {
  averageRating: string | null;
}

interface MonthlyRevenueData {
  month: string;
  revenue: string | null;
}

interface ProductStatusData {
  status: string;
  count: string | null;
}

@Injectable()
export class DashboardStatsService {
  constructor(private prisma: PrismaService) {}

  create(createDashboardStatInput: CreateDashboardStatInput) {
    return 'This action adds a new dashboardStat';
  }

  findAll() {
    return `This action returns all dashboardStats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboardStat`;
  }

  update(id: number, updateDashboardStatInput: UpdateDashboardStatInput) {
    return `This action updates a #${id} dashboardStat`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboardStat`;
  }

  async getSellerDashboardStats(shopId: string): Promise<SellerDashboardStats> {
    try {
      // 1. Tính tổng doanh thu
      const revenueData = await this.prisma.$queryRaw<RevenueData[]>`
        SELECT SUM(i.total_amount) as totalRevenue
        FROM Invoice i
        WHERE i.shop_id = ${shopId}
      `;
      const totalRevenue = parseFloat(revenueData[0]?.totalRevenue || '0');

      // 2. Đếm số lượng đơn hàng
      const orderCountData = await this.prisma.$queryRaw<OrderCountData[]>`
        SELECT COUNT(DISTINCT i.invoice_id) as orderCount
        FROM Invoice i
        WHERE i.shop_id = ${shopId}
      `;
      const orderCount = parseInt(orderCountData[0]?.orderCount || '0');

      // 3. Đếm số lượng sản phẩm
      const productCount = await this.prisma.product.count({
        where: {
          shop_id: shopId,
        },
      });

      // 4. Tính điểm đánh giá trung bình
      const ratingData = await this.prisma.$queryRaw<RatingData[]>`
        SELECT AVG(r.rating) as averageRating
        FROM Review r
        JOIN Product p ON r.product_id = p.product_id
        WHERE p.shop_id = ${shopId}
      `;
      const averageRating = parseFloat(ratingData[0]?.averageRating || '0');

      // 5. Doanh thu theo tháng (6 tháng gần nhất)
      const monthlyRevenueData = await this.prisma.$queryRaw<MonthlyRevenueData[]>`
      SELECT 
        DATE_FORMAT(i.create_at, '%m/%Y') as month,
        SUM(i.total_amount) as revenue
      FROM Invoice i
      WHERE i.shop_id = ${shopId}
      AND i.create_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(i.create_at, '%m/%Y')
      ORDER BY DATE_FORMAT(i.create_at, '%m/%Y') ASC
    `;
    
    const monthlyRevenue: MonthlyRevenue[] = Array.isArray(monthlyRevenueData) 
      ? monthlyRevenueData.map(item => ({
          month: item.month,
          revenue: parseFloat(item.revenue || '0')
        }))
      : [];

      // 6. Số lượng sản phẩm theo trạng thái
      const productStatusData = await this.prisma.$queryRaw<ProductStatusData[]>`
        SELECT order_status as status, COUNT(invoice_id) as count
        FROM Invoice
        WHERE shop_id = ${shopId}
        GROUP BY order_status
      `;
      
      const productStatusCount: ProductStatus[] = Array.isArray(productStatusData)
        ? productStatusData.map(item => ({
            status: item.status,
            count: parseInt(item.count || '0')
          }))
        : [];

      return {
        totalRevenue,
        orderCount,
        productCount,
        averageRating,
        monthlyRevenue,
        productStatusCount
      };
    } catch (error) {
      console.error('Error getting seller dashboard stats:', error);
      throw error;
    }
  }
}
