import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Helper function to format date for VNPay
  private formatVNPayDateTime(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }

  // Create VNPay URL for payment
  async createVNPayUrl(
    invoiceId: string,
    amount: number, 
    orderInfo: string, 
    returnUrl: string,
    ipAddr: string
  ): Promise<string> {
    try {
      const vnp_TmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
      const vnp_HashSecret = this.configService.get<string>('VNPAY_HASH_SECRET');
      const vnp_Url = this.configService.get<string>('VNPAY_URL');
      
      if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url) {
        throw new Error('Missing VNPay configuration');
      }

      const now = new Date();
      const createDate = this.formatVNPayDateTime(now);
      const expireDate = this.formatVNPayDateTime(new Date(now.getTime() + 15 * 60 * 1000));

      // Tạo đối tượng chứa parameters
      const vnp_Params: { [key: string]: string } = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnp_TmnCode,
        vnp_Amount: Math.round(amount * 100).toString(),
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: ipAddr,
        vnp_Locale: "vn",
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_ReturnUrl: returnUrl,
        vnp_ExpireDate: expireDate,
        vnp_TxnRef: invoiceId
      };

      // Sắp xếp các tham số theo thứ tự a-z
      const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((acc, key) => {
          if (vnp_Params[key] !== "" && vnp_Params[key] !== null && vnp_Params[key] !== undefined) {
            acc[key] = vnp_Params[key];
          }
          return acc;
        }, {} as { [key: string]: string });

      // Tạo chuỗi query từ các tham số đã sắp xếp
      const queryString = new URLSearchParams(sortedParams).toString();

      // Tạo chữ ký
      const hmac = crypto.createHmac('sha512', vnp_HashSecret);
      const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

      // Tạo URL cuối cùng
      return `${vnp_Url}?${queryString}&vnp_SecureHash=${signed}`;
    } catch (error) {
      console.error('Error creating VNPay URL:', error);
      throw new Error(`Failed to create VNPay URL: ${error.message}`);
    }
  }

  // Verify VNPay payment result
  verifyVNPayPaymentReturn(vnpParams: any): { isValid: boolean; responseCode: string } {
    try {
      const vnp_HashSecret = this.configService.get<string>('VNPAY_HASH_SECRET');
      
      if (!vnp_HashSecret) {
        throw new Error('Missing VNPay configuration');
      }

      // Get secure hash from params
      const vnp_SecureHash = vnpParams.vnp_SecureHash;
      
      // Remove hash and hash type from params
      const params = { ...vnpParams };
      delete params.vnp_SecureHash;
      delete params.vnp_SecureHashType;
      
      // Sắp xếp các tham số theo thứ tự a-z
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
            acc[key] = params[key];
          }
          return acc;
        }, {} as { [key: string]: string });

      // Tạo chuỗi query từ các tham số đã sắp xếp
      const queryString = new URLSearchParams(sortedParams).toString();
      
      // Create signature to verify
      const hmac = crypto.createHmac('sha512', vnp_HashSecret);
      const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');
      
      // Compare secure hash
      const isValid = vnp_SecureHash === signed;
      
      return {
        isValid,
        responseCode: vnpParams.vnp_ResponseCode,
      };
    } catch (error) {
      console.error('Error verifying VNPay payment:', error);
      throw new Error(`Failed to verify VNPay payment: ${error.message}`);
    }
  }

  // Update invoice status based on payment result
  async updateInvoicePaymentStatus(
    invoiceId: string, 
    paymentStatus: string
  ): Promise<any> {
    try {
      // Update the invoice in the database
      const updatedInvoice = await this.prisma.invoice.update({
        where: { invoice_id: invoiceId },
        data: { 
          payment_status: paymentStatus,
        },
      });
      
      return updatedInvoice;
    } catch (error) {
      console.error('Error updating invoice payment status:', error);
      throw new Error(`Failed to update invoice payment status: ${error.message}`);
    }
  }
} 