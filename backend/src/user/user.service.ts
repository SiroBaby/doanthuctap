import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../prisma.service';
import { User } from './entities/user.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';
import { Category } from 'src/category/entities/category.entity';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly invoiceService: InvoiceService,
  ) {}

  // create(createUserInput: CreateUserInput) {
  //   return 'This action adds a new user';
  // }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id_user: id,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const user = await this.prisma.user.update({
      where: {
        id_user: id,
      },
      data: {
        ...(updateUserInput.phone ? { phone: updateUserInput.phone } : {}),
        ...(updateUserInput.role ? { role: updateUserInput.role as any } : {}),
      },
    });
    return user;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async findAll({ page, limit, search }: PaginationInput) {
    try {
      const skip = (page - 1) * limit;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra email hợp lệ
      const isEmail = emailRegex.test(search);

      const whereCondition = search
        ? {
            OR: [
              { user_name: { contains: search } },
              ...(isEmail ? [{ email: { contains: search } }] : []),
            ],
          }
        : {};

      const [data, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy: {
            create_at: 'desc',
          },
        }),
        this.prisma.user.count({ where: whereCondition }),
      ]);

      return {
        data,
        totalCount,
        totalPage: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserPurchaseCategories(userId: string): Promise<Category[]> {
    try {
      // Lấy danh sách category từ các sản phẩm trong hóa đơn của người dùng
      const categories = await this.prisma.category.findMany({
        where: {
          products: {
            some: {
              product_variations: {
                some: {
                  invoice_products: {
                    some: {
                      invoice: {
                        id_user: userId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        distinct: ['category_id'],
      });

      // Chuyển đổi kết quả từ Prisma thành Category[]
      return categories.map((category) => ({
        category_id: category.category_id,
        category_name: category.category_name || '',
        create_at: category.create_at || undefined,
        update_at: category.update_at || undefined,
        delete_at: category.delete_at || undefined,
      }));
    } catch (error) {
      console.error('Error getting user purchase categories:', error);
      throw new Error('Failed to get user purchase categories');
    }
  }
}
