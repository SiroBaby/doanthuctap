import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductImageInput } from './dto/create-product-image.input';
import { UpdateProductImageInput } from './dto/update-product-image.input';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductImageService {
  constructor(private prisma: PrismaService) { }

  async create(createProductImageInput: CreateProductImageInput) {
    return this.prisma.product_Image.create({
      data: {
        product_id: createProductImageInput.product_id,
        image_url: createProductImageInput.image_url,
        is_thumbnail: createProductImageInput.is_thumbnail,
        create_at: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.product_Image.findMany();
  }

  async findOne(id: number) {
    const productImage = await this.prisma.product_Image.findUnique({
      where: { image_id: id },
    });

    if (!productImage) {
      throw new NotFoundException(`Product image with ID ${id} not found`);
    }

    return productImage;
  }

  async findByProductId(productId: number) {
    return this.prisma.product_Image.findMany({
      where: { product_id: productId },
    });
  }

  async update(id: number, updateProductImageInput: UpdateProductImageInput) {
    const { image_id, ...data } = updateProductImageInput;

    return this.prisma.product_Image.update({
      where: { image_id: id },
      data,
    });
  }

  async remove(id: number) {
    const productImage = await this.findOne(id);

    return this.prisma.product_Image.delete({
      where: { image_id: id },
    });
  }
}
