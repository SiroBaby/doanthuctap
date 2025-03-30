import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../prisma.service';
import { User } from './entities/user.entity';
import { PaginationInput } from 'src/common/dto/pagination.input';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

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
        ...(updateUserInput.role ? { role: updateUserInput.role as any } : {})
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
}
