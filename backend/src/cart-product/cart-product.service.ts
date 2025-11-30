import { Injectable } from '@nestjs/common';
import { CreateCartProductInput } from './dto/create-cart-product.input';
import { UpdateCartProductInput } from './dto/update-cart-product.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartProductService {
  constructor(private readonly prisma: PrismaService) { }

  async addProductToCart(addProductToCartInput: CreateCartProductInput) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        cart_id: addProductToCartInput.cart_id,
      },
    });
    if (!cart) {
      throw new Error('Cart not found');
    }

    //check product variation is exist
    const productVariation = await this.prisma.product_variation.findUnique({
      where: {
        product_variation_id: addProductToCartInput.product_variation_id,
      },
    });
    if (!productVariation) {
      throw new Error('Product variation not found');
    }

    //check product variation is already in cart
    const cartProduct = await this.prisma.cart_Product.findFirst({
      where: {
        AND: [
          { cart_id: addProductToCartInput.cart_id },
          { product_variation_id: addProductToCartInput.product_variation_id }
        ]
      },
    });
    if (cartProduct) {
      return this.increaseQuantity(cartProduct.cart_product_id, addProductToCartInput.quantity);
    }

    //check product variation stock quantity
    if (productVariation.stock_quantity < addProductToCartInput.quantity) {
      throw new Error('Product variation stock quantity is not enough');
    }

    return this.create(addProductToCartInput);
  }

  async getCartProducts(cart_id: string) {
    return this.prisma.cart_Product.findMany({
      where: {
        cart_id: cart_id
      },
      include: {
        product_variation: {
          include: {
            product: {
              include: {
                shop: true,
                product_images: {
                }
              }
            }
          }
        }
      }
    });
  }


  async create(createCartProductInput: CreateCartProductInput) {
    const cartProduct = await this.prisma.cart_Product.create({
      data: {
        cart_id: createCartProductInput.cart_id,
        product_variation_id: createCartProductInput.product_variation_id,
        quantity: createCartProductInput.quantity,
        is_selected: createCartProductInput.is_selected || false,
      },
    });
    return cartProduct;
  }

  async increaseQuantity(cartProductId: number, quantity: number) {
    const cartProduct = await this.prisma.cart_Product.findUnique({
      where: {
        cart_product_id: cartProductId,
      },
    });
    if (!cartProduct) {
      throw new Error('Cart product not found');
    }

    return this.prisma.cart_Product.update({
      where: { cart_product_id: cartProductId },
      data: {
        quantity: cartProduct.quantity + quantity,
      },
    });
  }

  async decreaseQuantity(cartProductId: number) {
    const cartProduct = await this.prisma.cart_Product.findUnique({
      where: {
        cart_product_id: cartProductId,
      },
    });
    if (!cartProduct) {
      throw new Error('Cart product not found');
    }

    return this.prisma.cart_Product.update({
      where: { cart_product_id: cartProductId },
      data: {
        quantity: cartProduct.quantity - 1,
      },
    });
  }

  findAll() {
    return `This action returns all cartProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cartProduct`;
  }

  update(id: number, updateCartProductInput: UpdateCartProductInput) {
    return `This action updates a #${id} cartProduct`;
  }

  async remove(cartproductid: number, productvariationid: number) {
    const cartProduct = await this.prisma.cart_Product.findUnique({
      where: {
        cart_product_id: cartproductid,
        product_variation_id: productvariationid,
      },
    });
    if (!cartProduct) {
      throw new Error('Cart product not found');
    }

    return this.prisma.cart_Product.delete({
      where: { cart_product_id: cartproductid, product_variation_id: productvariationid },
    });
  }
}
