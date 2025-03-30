"use client";

import React, { useState, useEffect } from "react";
import { Rating, Button, TextField, Box, Typography, Avatar, Card, CardContent, Alert, Divider, CircularProgress, Snackbar, Alert as MuiAlert } from "@mui/material";
import { GET_PRODUCT_REVIEWS, CHECK_USER_CAN_REVIEW, GET_USER_REVIEW_FOR_PRODUCT } from "@/graphql/queries";
import { CREATE_REVIEW } from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import { formatDistance } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "@clerk/nextjs";

interface Review {
  review_id: number;
  rating: number;
  comment: string | null;
  id_user: string;
  create_at: string;
  user: {
    user_name: string;
    avatar: string | null;
  };
}

interface ProductReviewProps {
  productId: number;
}

const ProductReview: React.FC<ProductReviewProps> = ({ productId }) => {
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("info");

  // Load product reviews
  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId },
    skip: !productId,
  });

  // Check if user can review this product
  const { data: canReviewData, loading: canReviewLoading } = useQuery(CHECK_USER_CAN_REVIEW, {
    variables: { userId, productId },
    skip: !isLoaded || !isSignedIn || !userId || !productId,
  });

  // Get user's existing review if any
  const { data: userReviewData, loading: userReviewLoading } = useQuery(GET_USER_REVIEW_FOR_PRODUCT, {
    variables: { userId, productId },
    skip: !isLoaded || !isSignedIn || !userId || !productId,
  });

  // Create review mutation
  const [createReview, { loading: createLoading }] = useMutation(CREATE_REVIEW, {
    onCompleted: () => {
      setSnackbarMessage("Đánh giá của bạn đã được gửi thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setRating(0);
      setComment("");
      refetchReviews();
    },
    onError: (error) => {
      if (error.message.includes("Bạn đã đánh giá sản phẩm này rồi")) {
        setSnackbarMessage("Bạn đã đánh giá sản phẩm này rồi và không thể đánh giá lại.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        // Refetch reviews và user review để cập nhật UI
        refetchReviews();
      } else {
        setSnackbarMessage(`Lỗi khi gửi đánh giá: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    },
  });

  // Load user's existing review if any
  useEffect(() => {
    if (userReviewData?.getUserReviewForProduct) {
      const userReview = userReviewData.getUserReviewForProduct;
      setRating(userReview.rating);
      setComment(userReview.comment || "");
    }
  }, [userReviewData]);

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleSubmitReview = () => {
    if (!rating) {
      setSnackbarMessage("Vui lòng chọn số sao đánh giá");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Create new review
    createReview({
      variables: {
        productId,
        userId,
        rating,
        comment: comment || null,
      },
    });
  };

  // Handle close snackbar
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (reviewsLoading || canReviewLoading || userReviewLoading) {
    return (
      <Box className="flex justify-center items-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  const reviews: Review[] = reviewsData?.getProductReviews?.data || [];
  const totalReviews = reviewsData?.getProductReviews?.totalCount || 0;
  const hasPurchased = canReviewData?.checkUserCanReview?.hasPurchased || false;
  const hasReviewed = canReviewData?.checkUserCanReview?.hasReviewed || false;

  // Calculate average rating
  const averageRating = 
    reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

  return (
    <Box className="w-full mt-4">
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Typography variant="h5" component="h2" className="font-semibold mb-4">
        Đánh giá sản phẩm
      </Typography>

      <Box className="mb-4">
        <Typography variant="h6" component="span" className="font-semibold">
          {averageRating.toFixed(1)}
        </Typography>
        <Rating value={averageRating} precision={0.5} readOnly />
        <Typography component="span" className="text-gray-600 ml-2">
          ({totalReviews} đánh giá)
        </Typography>
      </Box>

      {isLoaded && isSignedIn ? (
        <>
          {hasPurchased ? (
            <Box className="mb-6 bg-gray-50 p-4 rounded-lg">
              <Typography variant="h6" className="mb-2">
                {hasReviewed ? "Đánh giá của bạn" : "Viết đánh giá"}
              </Typography>

              {hasReviewed ? (
                <Box className="mb-4">
                  <Box className="flex items-center mb-2">
                    <Rating value={rating} readOnly className="mr-2" />
                    <Typography variant="body2" className="text-gray-600">
                      Đã đánh giá
                    </Typography>
                  </Box>
                  {comment && (
                    <Typography variant="body1" className="mb-2">
                      {comment}
                    </Typography>
                  )}
                  <Alert severity="info" className="mb-2">
                    Bạn chỉ được đánh giá sản phẩm này một lần và không được phép chỉnh sửa sau khi đã gửi.
                  </Alert>
                </Box>
              ) : (
                <>
                  <Box className="mb-4">
                    <Typography component="legend" className="mb-2">
                      Đánh giá của bạn:
                    </Typography>
                    <Rating
                      name="product-rating"
                      value={rating}
                      onChange={handleRatingChange}
                      size="large"
                    />
                  </Box>

                  <TextField
                    label="Nhận xét của bạn"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={handleCommentChange}
                    variant="outlined"
                    fullWidth
                    className="mb-4"
                  />

                  <Box className="flex">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitReview}
                      disabled={createLoading}
                    >
                      {createLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Gửi đánh giá"
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Alert severity="info" className="mb-4">
              Bạn cần mua sản phẩm này trước khi đánh giá.
            </Alert>
          )}
        </>
      ) : (
        <Alert severity="info" className="mb-4">
          Vui lòng đăng nhập để đánh giá sản phẩm này.
        </Alert>
      )}

      <Divider className="my-4" />

      <Typography variant="h6" className="mb-4">
        Tất cả đánh giá ({totalReviews})
      </Typography>

      {reviews.length > 0 ? (
        <Box className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.review_id} className="w-full">
              <CardContent>
                <Box className="flex items-start">
                  <Avatar 
                    src={review.user?.avatar || "/logo/avt-capy.png"} 
                    alt={review.user?.user_name || "User"} 
                    className="mr-3"
                  />
                  <Box className="flex-1">
                    <Box className="flex justify-between items-center mb-1">
                      <Typography variant="subtitle1" className="font-semibold">
                        {review.user?.user_name || "Người dùng"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {review.create_at
                          ? formatDistance(new Date(review.create_at), new Date(), {
                              addSuffix: true,
                              locale: vi,
                            })
                          : ""}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} size="small" readOnly />
                    {review.comment && (
                      <Typography variant="body2" className="mt-2">
                        {review.comment}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box className="p-4 bg-gray-50 rounded text-center">
          <Typography>Chưa có đánh giá nào cho sản phẩm này.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductReview;
