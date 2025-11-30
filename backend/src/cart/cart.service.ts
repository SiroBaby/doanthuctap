import { Injectable } from '@nestjs/common';
import { CreateCartInput } from './dto/create-cart.input';
import { UpdateCartInput } from './dto/update-cart.input';
import { PrismaService } from '../prisma.service';
@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) { }

  async getOrCreateCart(Id: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        id_user: Id,
        status: 'active'
      },
      include: {
        cart_products: true
      }
    });

    if (!cart) {
      return await this.create({ id_user: Id, cart_id: Id + '_' + Date.now(), status: 'active' });
    }

    return cart;
  }

  async create(createCartInput: CreateCartInput) {
    return this.prisma.cart.create({
      data: {
        cart_id: createCartInput.id_user + '_' + Date.now(),
        id_user: createCartInput.id_user,
        status: 'active'
      }
    });
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartInput: UpdateCartInput) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
