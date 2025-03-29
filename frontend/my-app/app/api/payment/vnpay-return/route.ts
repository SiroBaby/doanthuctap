import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // Get all query parameters
        const url = new URL(req.url);
        const searchParams = url.searchParams;
        const params: Record<string, string> = {};
        
        // Convert searchParams to a standard object
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Get the API URL from environment variables
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3301';
        
        // Forward the parameters to the backend API
        const response = await fetch(`${apiUrl}/payment/vnpay-return?${searchParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Backend should return a redirect URL, so we'll redirect to where the backend tells us to
        if (response.redirected) {
            return NextResponse.redirect(response.url);
        }

        // If backend didn't redirect (fallback logic)
        // Lấy thông tin từ session storage nếu có thể
        const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // Invoice ID
        const vnp_ResponseCode = searchParams.get('vnp_ResponseCode') || '';
        
        // Nếu thanh toán thành công và có mã hóa đơn
        if (vnp_ResponseCode === '00' && vnp_TxnRef) {
            // Thử lấy user ID từ sessionStorage (cần được lưu trước khi thanh toán)
            // Trong hàm handleVNPayPayment của frontend cần lưu user ID vào sessionStorage
            try {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3301';
                
                // Lấy thông tin invoice để biết user ID
                const invoiceResponse = await fetch(`${apiUrl}/invoices/${vnp_TxnRef}`);
                
                if (invoiceResponse.ok) {
                    const invoiceData = await invoiceResponse.json();
                    if (invoiceData && invoiceData.id_user) {
                        // Chuyển hướng về trang chi tiết đơn hàng
                        return NextResponse.redirect(`${baseUrl}/customer/user/purchase/${invoiceData.id_user}/${vnp_TxnRef}`);
                    }
                }
            } catch (error) {
                console.error("Error getting invoice details:", error);
            }
        }
        
        // Fallback nếu không lấy được thông tin cần thiết
        let status = 'error';
        if (vnp_ResponseCode === '00') {
            status = 'completed';
        } else if (vnp_ResponseCode === '24') {
            status = 'cancelled';
        }
        
        // Redirect to payment result page as fallback
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUrl = `${baseUrl}/customer/payment-result?status=${status}&code=${vnp_ResponseCode}`;
        
        return NextResponse.redirect(redirectUrl);
    } catch (error: unknown) {
        console.error("Error processing VNPay return:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Redirect to error page in case of exception
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${baseUrl}/customer/payment-result?status=error&message=${encodeURIComponent(errorMessage)}`);
    }
} 