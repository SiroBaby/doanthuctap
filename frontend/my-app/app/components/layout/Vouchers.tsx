"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client";
import { GET_LATEST_VALID_VOUCHERS, GET_USER_VOUCHER_STORAGE } from "@/graphql/queries";
import { SAVE_VOUCHER } from "@/graphql/mutations";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Voucher {
  id: number;
  code: string;
  discount_percent: number;
  minimum_require_price: number;
  max_discount_price: number;
  valid_to: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface VouchersProps {
  passedVouchers?: Voucher[];
  limit?: number;
}

const Vouchers = ({ passedVouchers, limit = 2 }: VouchersProps = {}) => {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [savingVoucherId, setSavingVoucherId] = useState<number | null>(null);
  const [savedVouchers, setSavedVouchers] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch the latest valid vouchers only if passedVouchers is not provided
  const { data, loading, error } = useQuery(GET_LATEST_VALID_VOUCHERS, {
    variables: { limit },
    skip: !!passedVouchers,
  });

  // Fetch user's saved vouchers if user is logged in
  const { data: userVoucherData } = useQuery(GET_USER_VOUCHER_STORAGE, {
    variables: { userId: user?.id },
    skip: !isSignedIn || !user,
  });

  // Initialize saved vouchers from user data
  useEffect(() => {
    if (userVoucherData?.getUserVouchersByUserId) {
      const savedVoucherIds = userVoucherData.getUserVouchersByUserId
        .filter((storage: { voucher_type: string }) => storage.voucher_type === 'voucher')
        .map((storage: { voucher_id: number }) => storage.voucher_id);
      setSavedVouchers(savedVoucherIds);
    }
  }, [userVoucherData]);

  // Save voucher mutation
  const [saveVoucher] = useMutation(SAVE_VOUCHER, {
    onCompleted: (data) => {
      setSavedVouchers(prev => [...prev, Number(data.createVoucherStorage.voucher_id)]);
      setSnackbar({
        open: true,
        message: "Đã lưu mã giảm giá thành công!",
        severity: "success",
      });
      setSavingVoucherId(null);
    },
    onError: (error) => {
      const errorMessage = error.message.includes("đã lưu mã giảm giá này") || 
                          error.message.includes("already saved") 
                          ? "Bạn đã lưu mã giảm giá này rồi"
                          : "Không thể lưu mã giảm giá. Vui lòng thử lại.";
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      setSavingVoucherId(null);
    },
  });

  // Handle save voucher
  const handleSaveVoucher = async (voucher: Voucher) => {
    if (!isSignedIn || !user) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để lưu mã giảm giá",
        severity: "info",
      });
      router.push("/sign-in");
      return;
    }

    // Check if already saved
    if (savedVouchers.includes(voucher.id)) {
      setSnackbar({
        open: true,
        message: "Bạn đã lưu mã giảm giá này rồi",
        severity: "info",
      });
      return;
    }

    setSavingVoucherId(voucher.id);

    try {
      await saveVoucher({
        variables: {
          createVoucherStorageInput: {
            user_id: user.id,
            voucher_id: voucher.id,
            voucher_type: "voucher",
            claimed_at: new Date().toISOString(),
            is_used: false,
          },
        },
      });
    } catch (error) {
      console.error("Error saving voucher:", error);
      setSavingVoucherId(null);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state when fetching data and no passed vouchers
  if (loading && !passedVouchers) {
    return (
      <div className="flex justify-center items-center py-10">
        <CircularProgress />
      </div>
    );
  }

  // Show error state
  if (error && !passedVouchers) {
    return (
      <div className="text-center py-4 text-red-500">
        Không thể tải mã giảm giá. Vui lòng thử lại sau.
      </div>
    );
  }

  // Determine which vouchers to display
  const vouchers: Voucher[] = passedVouchers || (data?.getLatestValidVouchers || []);

  // If no vouchers found
  if (vouchers.length === 0) {
    return (
      <div className="text-center py-4">
        Hiện tại không có mã giảm giá nào khả dụng.
      </div>
    );
  }

  // Format date to human-readable
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Không xác định";
    }
  };

  // Format price to display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      {vouchers.map((voucher) => (
        <div 
          key={voucher.id} 
          className="relative bg-voucher rounded-lg overflow-hidden mb-4"
        >
          <div className="flex flex-col sm:flex-row items-center p-2 sm:p-4">
            <div className="flex-shrink-0 mb-2 sm:mb-0 sm:mr-4">
              <Image
                src="/icon/voucher-w.png"
                width={80}
                height={60}
                className="w-16 h-auto sm:w-20 md:w-24 lg:w-32"
                alt="Voucher Ticket"
              />
            </div>

            <div className="flex-grow text-center sm:text-left mb-2 sm:mb-0">
              <h3 className="font-bold text-base sm:text-lg">
                GIẢM {voucher.discount_percent * 100}%
              </h3>
              <p className="font-medium text-sm sm:text-base">
                ĐƠN TỐI THIỂU {formatPrice(voucher.minimum_require_price)}
              </p>
              <p className="text-xs sm:text-sm">
                Thời hạn đến {formatDate(voucher.valid_to)}
              </p>
            </div>

            <div className="flex-shrink-0">
              <button 
                className={`
                  ${savedVouchers.includes(voucher.id) 
                    ? 'bg-gray-500' 
                    : 'bg-button hover:bg-violet-600'
                  } 
                  text-white px-6 sm:px-8 md:px-11 py-1 sm:py-2 rounded border-collapse border border-black text-sm sm:text-base
                `}
                onClick={() => handleSaveVoucher(voucher)}
                disabled={savedVouchers.includes(voucher.id) || savingVoucherId === voucher.id}
              >
                {savingVoucherId === voucher.id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : savedVouchers.includes(voucher.id) ? (
                  "ĐÃ LƯU"
                ) : (
                  "LƯU"
                )}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Vouchers;
