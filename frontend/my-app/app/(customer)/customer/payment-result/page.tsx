"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const PaymentResultPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');

  useEffect(() => {
    // Get status and code from query params
    const statusParam = searchParams.get('status');
    // codeParam is used for debugging purposes if needed
    // but we can remove it since it's not currently used
    const errorMessage = searchParams.get('message');
    
    // Clear any pending orders
    sessionStorage.removeItem('pendingOrder');
    
    // Set appropriate status and message based on parameters
    if (statusParam === 'completed') {
      setStatus('success');
      setMessage('Thanh toán thành công! Đang chuyển hướng...');
      toast.success('Thanh toán đơn hàng thành công!');
    } else if (statusParam === 'cancelled') {
      setStatus('error');
      setMessage('Bạn đã hủy thanh toán');
      toast.error('Thanh toán đã bị hủy');
    } else if (statusParam === 'error') {
      setStatus('error');
      setMessage(`Thanh toán thất bại: ${errorMessage || 'Có lỗi xảy ra'}`);
      toast.error(`Thanh toán thất bại: ${errorMessage || 'Có lỗi xảy ra'}`);
    } else {
      setStatus('error');
      setMessage('Trạng thái thanh toán không xác định');
      toast.error('Trạng thái thanh toán không xác định');
    }
    
    // Redirect to the purchase history page after 3 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/customer/user/purchase');
    }, 3000);
    
    // Clean up timer when component unmounts
    return () => clearTimeout(redirectTimer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-red mx-auto mb-4"></div>
        )}
        {status === 'success' && (
          <div className="text-green-500 text-5xl mb-4">✓</div>
        )}
        {status === 'error' && (
          <div className="text-red-500 text-5xl mb-4">×</div>
        )}
        <h1 className="text-2xl font-bold mb-4">{message}</h1>
        <p className="text-gray-600 mb-8">Bạn sẽ được chuyển hướng tự động đến trang lịch sử đơn hàng...</p>
        
        <button 
          onClick={() => router.push('/customer/user/purchase')}
          className="bg-custom-red text-white py-2 px-6 rounded hover:bg-red-700 transition-colors"
        >
          Xem đơn hàng của tôi
        </button>
      </div>
    </div>
  );
};

export default PaymentResultPage; 