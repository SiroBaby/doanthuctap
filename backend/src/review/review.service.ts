import { Injectable } from '@nestjs/common';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { PrismaService } from '../prisma.service';
import ReviewPagination from './entities/reviewpagination.entity';
import { ReviewPaginationInput } from './dto/review-pagination.input';
import { ReviewCheckResult } from './dto/review-check-result';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewInput: CreateReviewInput) {
    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await this.prisma.review.findFirst({
      where: {
        product_id: createReviewInput.product_id,
        id_user: createReviewInput.id_user,
      },
    });

    if (existingReview) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }

    // Kiểm tra xem người dùng đã mua sản phẩm chưa
    const canReviewResult = await this.checkUserCanReview(createReviewInput.id_user, createReviewInput.product_id);
    if (!canReviewResult.hasPurchased) {
      throw new Error('Bạn cần mua sản phẩm trước khi đánh giá');
    }

    // Tạo đánh giá mới
    return this.prisma.review.create({
      data: {
        ...createReviewInput,
        create_at: new Date(),
      },
    });
  }

  async update(updateReviewInput: UpdateReviewInput) {
    // Kiểm tra xem review có tồn tại không
    const existingReview = await this.prisma.review.findUnique({
      where: {
        review_id: updateReviewInput.review_id,
      },
    });

    if (!existingReview) {
      throw new Error('Không tìm thấy đánh giá');
    }

    // Cập nhật đánh giá
    return this.prisma.review.update({
      where: {
        review_id: updateReviewInput.review_id,
      },
      data: {
        ...updateReviewInput,
        update_at: new Date(),
      },
    });
  }

  async getProductReviews(productId: number, paginationInput: ReviewPaginationInput): Promise<ReviewPagination> {
    const { page, limit } = paginationInput;
    const skip = (page - 1) * limit;

    // Lấy tổng số đánh giá
    const totalCount = await this.prisma.review.count({
      where: {
        product_id: productId,
      },
    });

    // Lấy danh sách đánh giá
    const reviews = await this.prisma.review.findMany({
      where: {
        product_id: productId,
      },
      include: {
        user: {
          select: {
            user_name: true,
            avatar: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        create_at: 'desc', // Mới nhất lên đầu
      },
    });

    // Chuyển đổi prisma model sang GraphQL type
    const data = reviews.map(review => ({
      review_id: review.review_id,
      rating: review.rating,
      comment: review.comment,
      is_review: review.is_review,
      product_id: review.product_id,
      id_user: review.id_user,
      create_at: review.create_at,
      update_at: review.update_at,
      user: review.user ? {
        user_name: review.user.user_name,
        avatar: review.user.avatar,
        id_user: review.id_user,
        email: '',
        password: '',
        role: 'user'
      } : undefined
    }));

    return {
      data,
      totalCount,
      totalPage: Math.ceil(totalCount / limit),
    };
  }

  async getUserReviewForProduct(userId: string, productId: number) {
    return this.prisma.review.findFirst({
      where: {
        id_user: userId,
        product_id: productId,
      },
    });
  }

  async checkUserCanReview(userId: string, productId: number): Promise<ReviewCheckResult> {
    // Kiểm tra xem người dùng đã mua sản phẩm này chưa
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
      select: { shop_id: true }
    });

    if (!product) {
      return {
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        shopId: undefined
      };
    }

    // Lấy danh sách các đơn hàng đã hoàn thành của người dùng
    const completedInvoices = await this.prisma.invoice.findMany({
      where: {
        id_user: userId,
        shop_id: product.shop_id,
        order_status: 'DELIVERED', // Chỉ lấy đơn hàng đã giao thành công
      },
      include: {
        invoice_products: {
          where: {
            product_variation: {
              product: {
                product_id: productId
              }
            }
          }
        }
      }
    });

    // Kiểm tra xem người dùng đã mua sản phẩm này chưa
    const hasPurchased = completedInvoices.some(invoice => 
      invoice.invoice_products.length > 0
    );

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await this.prisma.review.findFirst({
      where: {
        id_user: userId,
        product_id: productId,
      },
    });

    const hasReviewed = !!existingReview;

    // Người dùng chỉ có thể đánh giá nếu đã mua sản phẩm và chưa đánh giá
    return {
      canReview: hasPurchased && !hasReviewed,
      hasPurchased,
      hasReviewed,
      shopId: product.shop_id
    };
  }
} 