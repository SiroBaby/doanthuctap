import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from '../prisma.service';
import { User } from './entities/user.entity';

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
      data: updateUserInput.phone ? { phone: updateUserInput.phone } : {},
    });
    return user;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async listUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
