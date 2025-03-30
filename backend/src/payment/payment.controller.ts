import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CreateVNPayUrlDto } from './dto/create-vnpay-url.dto';
import { PrismaService } from '../prisma.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService
  ) {}

  @Post('create-vnpay-url')
  async createVNPayUrl(@Body() createVNPayUrlDto: CreateVNPayUrlDto, @Req() req: Request) {
    try {
      const { invoiceId, amount, orderInfo } = createVNPayUrlDto;
      
      // Get client IP address
      const ipAddr = req.headers['x-forwarded-for'] as string || 
                    req.connection.remoteAddress || 
                    'unknown';
      
      // Define return URL
      const returnUrl = `${process.env.VNPAY_RETURN_URL}`;
      
      // Create VNPay URL
      const paymentUrl = await this.paymentService.createVNPayUrl(
        invoiceId,
        amount,
        orderInfo,
        returnUrl,
        ipAddr
      );
      
      return { success: true, paymentUrl };
    } catch (error) {
      console.error('Error creating VNPay URL:', error);
      return { success: false, message: error.message };
    }
  }

  @Get('vnpay-return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    try {
      // Verify payment result
      const { isValid, responseCode } = this.paymentService.verifyVNPayPaymentReturn(query);
      
      if (!isValid) {
        console.error('Invalid VNPay return data');
        return res.redirect(`${process.env.FRONTEND_URL}/customer/payment-result?status=error&code=97`);
      }
      
      // Get invoice ID
      const invoiceId = query.vnp_TxnRef as string | undefined;
      
      if (!invoiceId) {
        console.error('Missing invoice ID in VNPay return data');
        return res.redirect(`${process.env.FRONTEND_URL}/customer/payment-result?status=error&code=98`);
      }
      
      // Biến invoiceId là string qua điều kiện kiểm tra ở trên
      let paymentStatus = 'FAILED';
      
      // Process payment result based on response code
      if (responseCode === '00') {
        paymentStatus = 'COMPLETED';
        
        try {
          // Lấy thông tin invoice đầu tiên
          const invoice = await this.prisma.invoice.findUnique({
            where: { invoice_id: invoiceId },
            select: { id_user: true, payment_method: true }
          });
          
          if (invoice && invoice.payment_method) {
            // Cập nhật tất cả hoá đơn của người dùng này với phương thức thanh toán tương tự
            await this.paymentService.updateAllInvoicesByUserId(
              invoice.id_user,
              invoice.payment_method,
              paymentStatus
            );
            
            // Cập nhật hoá đơn chính (để đảm bảo)
            await this.paymentService.updateInvoicePaymentStatus(invoiceId, paymentStatus);
            
            // Chuyển hướng về trang chi tiết đơn hàng
            return res.redirect(`${process.env.FRONTEND_URL}/customer/user/purchase/${invoice.id_user}/${invoiceId}`);
          }
        } catch (error) {
          console.error('Error processing payment update:', error);
        }
      } else if (responseCode === '24') {
        paymentStatus = 'CANCELLED';
      }
      
      // Fallback: Chuyển hướng về trang kết quả thanh toán nếu không lấy được thông tin invoice
      return res.redirect(`${process.env.FRONTEND_URL}/customer/payment-result?status=${paymentStatus.toLowerCase()}&code=${responseCode}`);
    } catch (error) {
      console.error('Error processing VNPay return:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/customer/payment-result?status=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  @Post('vnpay-ipn')
  async vnpayIPN(@Body() body: any, @Query() query: any) {
    try {
      // Verify payment result
      const { isValid, responseCode } = this.paymentService.verifyVNPayPaymentReturn(query);
      
      if (!isValid) {
        return { RspCode: '97', Message: 'Invalid signature' };
      }
      
      // Get invoice ID
      const invoiceId = query.vnp_TxnRef as string | undefined;
      
      if (!invoiceId) {
        return { RspCode: '98', Message: 'Missing invoice ID' };
      }
      
      // Process payment result based on response code
      if (responseCode === '00') {
        try {
          // Lấy thông tin invoice đầu tiên
          const invoice = await this.prisma.invoice.findUnique({
            where: { invoice_id: invoiceId },
            select: { id_user: true, payment_method: true }
          });
          
          if (invoice && invoice.payment_method) {
            // Cập nhật tất cả hoá đơn của người dùng này với phương thức thanh toán tương tự
            await this.paymentService.updateAllInvoicesByUserId(
              invoice.id_user,
              invoice.payment_method,
              'COMPLETED'
            );
            
            // Đảm bảo invoice gốc được cập nhật
            await this.paymentService.updateInvoicePaymentStatus(invoiceId, 'COMPLETED');
          }
        } catch (error) {
          console.error('Error updating invoices in IPN:', error);
        }
        
        return { RspCode: '00', Message: 'Confirm Success' };
      }
      
      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      console.error('Error processing VNPay IPN:', error);
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }
} 