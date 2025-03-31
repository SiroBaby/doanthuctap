import { Injectable } from '@nestjs/common';
import { CreateVoucherStorageInput } from './dto/create-voucher-storage.input';
import { UpdateVoucherStorageInput } from './dto/update-voucher-storage.input';
import { PrismaService } from 'src/prisma.service';
import { Voucher_type } from '@prisma/client';

@Injectable()
export class VoucherStorageService {

  constructor(private prisma: PrismaService) {}

  async create(createVoucherStorageInput: CreateVoucherStorageInput) {
    const { user_id, voucher_id, voucher_type, claimed_at, is_used } = createVoucherStorageInput;
    
    // Kiểm tra xem người dùng đã lưu voucher này chưa
    const existingVoucher = await this.prisma.voucher_storage.findFirst({
      where: {
        user_id,
        voucher_id: Number(voucher_id),
        voucher_type,
      },
    });
    
    if (existingVoucher) {
      throw new Error('Bạn đã lưu mã giảm giá này rồi');
    }
  
    // Kiểm tra voucher có tồn tại và hợp lệ không
    const currentDate = new Date();
    if (voucher_type === 'voucher') {
      const voucher = await this.prisma.voucher.findFirst({
        where: {
          id: Number(voucher_id),
          delete_at: null, // Chưa bị xóa mềm
          valid_to: { gte: currentDate }, // Chưa hết hạn
        },
      });
      
      if (!voucher) {
        throw new Error(`Không tìm thấy mã giảm giá hệ thống hợp lệ có ID ${voucher_id}`);
      }
    } else if (voucher_type === 'shop_voucher') {
      const shopVoucher = await this.prisma.shop_Voucher.findFirst({
        where: {
          id: Number(voucher_id),
          delete_at: null, // Chưa bị xóa mềm
          valid_to: { gte: currentDate }, // Chưa hết hạn
        },
      });
      
      if (!shopVoucher) {
        throw new Error(`Không tìm thấy mã giảm giá shop hợp lệ có ID ${voucher_id}`);
      }
    }
  
    try {
      // Tạo bản ghi voucher_storage
      return await this.prisma.voucher_storage.create({
        data: {
          user_id,
          voucher_id: Number(voucher_id),
          voucher_type,
          claimed_at: claimed_at ? new Date(claimed_at) : new Date(),
          is_used: is_used || false,
        },
        include: {
          voucher: voucher_type === 'voucher',
          shop_voucher: voucher_type === 'shop_voucher',
        },
      });
    } catch (error) {
      console.error('Lỗi khi lưu mã giảm giá:', error);
      if (error.code === 'P2003') { // Lỗi khóa ngoại
        throw new Error('Mã giảm giá không tồn tại trong hệ thống');
      }
      throw new Error(`Không thể lưu mã giảm giá: ${error.message}`);
    }
  }
  getUserVouchersByUserId(userId: string) {
    return this.prisma.voucher_storage.findMany({
      where: {
        user_id: userId,
      },
      include: {
        voucher: true,
        shop_voucher: true,
      },
    });
  }

  async getUserVouchersForCheckout(userId: string, shopId: string) {
    const vouchers = await this.prisma.voucher_storage.findMany({
      where: {
        user_id: userId,
        is_used: false,
        OR: [
          {
            voucher_type: 'shop_voucher',
            shop_voucher: {
              shop_id: shopId,
            },
          },
          {
            voucher_type: 'voucher',
          },
        ],
      },
      include: {
        voucher: {
          select: {
            id: true,
            code: true,
            discount_percent: true,
            minimum_require_price: true,
            max_discount_price: true,
            quantity: true,
            max_use_per_user: true,
            valid_from: true,
            valid_to: true,
            create_at: true,
            delete_at: true,
          },
        },
        shop_voucher: {
          select: {
            id: true,
            code: true,
            discount_percent: true,
            minimum_require_price: true,
            max_discount_price: true,
            quantity: true,
            max_use_per_user: true,
            valid_from: true,
            valid_to: true,
            create_at: true,
            delete_at: true,
            shop_id: true,
          },
        },
      },
    });
  
    // Trả về mảng đã transform, không bọc trong object "data"
    return vouchers.map((voucher) => ({
      voucher_storage_id: voucher.voucher_storage_id,
      user_id: voucher.user_id,
      voucher_id: voucher.voucher_id.toString(),
      voucher_type: voucher.voucher_type,
      claimed_at: voucher.claimed_at,
      voucher: voucher.voucher_type === 'voucher' && voucher.voucher ? {
        id: voucher.voucher.id,
        code: voucher.voucher.code,
        discount_percent: voucher.voucher.discount_percent,
        minimum_require_price: Number(voucher.voucher.minimum_require_price),
        max_discount_price: Number(voucher.voucher.max_discount_price),
        quantity: voucher.voucher.quantity,
        max_use_per_user: voucher.voucher.max_use_per_user,
        valid_from: voucher.voucher.valid_from,
        valid_to: voucher.voucher.valid_to,
        create_at: voucher.voucher.create_at,
        delete_at: voucher.voucher.delete_at,
      } : null,
      shop_voucher: voucher.voucher_type === 'shop_voucher' && voucher.shop_voucher ? {
        id: voucher.shop_voucher.id,
        code: voucher.shop_voucher.code,
        discount_percent: voucher.shop_voucher.discount_percent,
        minimum_require_price: Number(voucher.shop_voucher.minimum_require_price),
        max_discount_price: Number(voucher.shop_voucher.max_discount_price),
        quantity: voucher.shop_voucher.quantity,
        max_use_per_user: voucher.shop_voucher.max_use_per_user,
        valid_from: voucher.shop_voucher.valid_from,
        valid_to: voucher.shop_voucher.valid_to,
        create_at: voucher.shop_voucher.create_at,
        delete_at: voucher.shop_voucher.delete_at,
        shop_id: voucher.shop_voucher.shop_id,
      } : null,
    }));
  }

  findAll() {
    return `This action returns all voucherStorage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} voucherStorage`;
  }

  update(id: number, updateVoucherStorageInput: UpdateVoucherStorageInput) {
    return `This action updates a #${id} voucherStorage`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucherStorage`;
  }

  async removeExpiredVouchers(userId: string) {
    const currentDate = new Date();
    
    // Find expired vouchers in user's storage
    const expiredVouchers = await this.prisma.voucher_storage.findMany({
      where: {
        user_id: userId,
        OR: [
          {
            voucher_type: 'voucher',
            voucher: {
              valid_to: {
                lt: currentDate,
              },
            },
          },
          {
            voucher_type: 'shop_voucher',
            shop_voucher: {
              valid_to: {
                lt: currentDate,
              },
            },
          },
        ],
      },
    });

    // Delete expired vouchers
    if (expiredVouchers.length > 0) {
      const voucherIds = expiredVouchers.map(v => v.voucher_storage_id);
      await this.prisma.voucher_storage.deleteMany({
        where: {
          voucher_storage_id: {
            in: voucherIds,
          },
        },
      });
    }

    return {
      count: expiredVouchers.length,
      message: `Removed ${expiredVouchers.length} expired vouchers`,
    };
  }
}
