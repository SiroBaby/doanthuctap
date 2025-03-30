import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import ReviewPagination from './entities/reviewpagination.entity';
import { ReviewPaginationInput } from './dto/review-pagination.input';
import { ReviewCheckResult } from './dto/review-check-result';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => Review)
  createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ) {
    return this.reviewService.create(createReviewInput);
  }

  @Mutation(() => Review)
  updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
  ) {
    return this.reviewService.update(updateReviewInput);
  }

  @Query(() => ReviewPagination, { name: 'getProductReviews' })
  getProductReviews(
    @Args('productId', { type: () => Int }) productId: number,
    @Args('pagination', { type: () => ReviewPaginationInput, nullable: true }) 
    paginationInput: ReviewPaginationInput = { page: 1, limit: 10 },
  ) {
    return this.reviewService.getProductReviews(productId, paginationInput);
  }

  @Query(() => Review, { name: 'getUserReviewForProduct', nullable: true })
  getUserReviewForProduct(
    @Args('userId', { type: () => String }) userId: string,
    @Args('productId', { type: () => Int }) productId: number,
  ) {
    return this.reviewService.getUserReviewForProduct(userId, productId);
  }

  @Query(() => ReviewCheckResult, { name: 'checkUserCanReview' })
  checkUserCanReview(
    @Args('userId', { type: () => String }) userId: string,
    @Args('productId', { type: () => Int }) productId: number,
  ) {
    return this.reviewService.checkUserCanReview(userId, productId);
  }
} 