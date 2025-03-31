"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_VOUCHERS } from "@/graphql/queries";
import Vouchers from "@/app/components/layout/Vouchers";
import { CircularProgress, Pagination } from "@mui/material";

interface Voucher {
  id: number;
  code: string;
  discount_percent: number;
  minimum_require_price: number;
  max_discount_price: number;
  valid_to: string;
  delete_at: string | null;
  create_at: string;
}

interface VouchersResponse {
  vouchers: {
    totalCount: number;
    totalPage: number;
    data: Voucher[];
  };
}

const VoucherPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data, loading, error } = useQuery<VouchersResponse>(GET_VOUCHERS, {
    variables: {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: "",
    },
  });

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Lọc voucher còn hiệu lực và sắp xếp từ mới đến cũ
  const validVouchers = data?.vouchers.data
    .filter(voucher => !voucher.delete_at && new Date(voucher.valid_to) > new Date())
    .sort((a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()) || [];

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-blue-500 pb-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-1"></div>
        <div className="col-span-10">
          {/* Thanh điều hướng */}
          <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-center text-sm text-gray-500">
              <span>Home</span>
              <span className="mx-2">/</span>
              <span>Voucher</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 bg-white rounded-lg shadow-sm">
            <div className="col-span-1"></div>
            <div className="col-span-10 py-4">
              <h1 className="text-2xl font-bold mb-6 text-center">Mã Giảm Giá</h1>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <CircularProgress />
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">
                  Đã xảy ra lỗi khi tải mã giảm giá. Vui lòng thử lại sau.
                </div>
              ) : validVouchers.length === 0 ? (
                <div className="text-center py-10">
                  Không có mã giảm giá nào khả dụng.
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {validVouchers.map((voucher) => (
                    <div key={voucher.id}>
                      <Vouchers passedVouchers={[voucher]} />
                    </div>
                  ))}
                </div>
              )}

              {data && data.vouchers.totalPage > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    count={data.vouchers.totalPage}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </div>
              )}
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>
    </div>
  );
};

export default VoucherPage;
