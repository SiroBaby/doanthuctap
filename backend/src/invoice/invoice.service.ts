import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateInvoiceStatusInput } from './dto/update-invoice-status.input';
import { GetInvoicesByShopInput } from './dto/get-invoices-by-shop.input';
import { GetOutOfStockProductsInput } from './dto/get-out-of-stock-products.input';
import { InvoicePagination, OrderStatus } from './entities/invoice.entity';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(createInvoiceInput: CreateInvoiceInput) {
    try {
      const { 
        user_id, 
        shop_id, 
        payment_method, 
        shipping_address_id, 
        products,
        total_amount,
        shipping_fee,
        voucher_storage_id
      } = createInvoiceInput;
      
      // Calculate the actual total for this shop's products
      const shopProductsTotal = products.reduce((sum, product) => 
        sum + (product.price * product.quantity), 0);
      
      // If total_amount is negative or doesn't make sense, recalculate it
      let finalAmount = shopProductsTotal;
      
      // Only apply a discount if it makes sense (positive and not too large)
      if (shopProductsTotal > total_amount && total_amount >= 0) {
        finalAmount = total_amount;
      }
      
      // Ensure final amount is never negative
      finalAmount = Math.max(0, finalAmount);
      
      // Generate a unique invoice ID
      const invoice_id = uuidv4();
      
      // Create the invoice record
      const invoice = await this.prisma.invoice.create({
        data: {
          invoice_id,
          id_user: user_id,
          shop_id,
          payment_method,
          // For COD, set payment status as pending
          payment_status: payment_method === 'COD' ? 'pending' : 'awaiting_payment',
          // Initial order status is "pending"
          order_status: 'pending',
          total_amount: finalAmount,
          shipping_fee,
          shipping_address_id,
          voucher_storage_id,
          create_at: new Date(),
          update_at: new Date()
        },
        include: {
          user: true,
        }
      });
      
      // Create invoice product records for each product
      const invoiceProducts: any[] = [];
      for (const product of products) {
        const invoiceProduct = await this.prisma.invoice_Product.create({
          data: {
            invoice_id,
            product_variation_id: product.product_variation_id,
            product_name: product.product_name,
            variation_name: product.variation_name,
            price: product.price, // Final price after all discounts
            original_price: product.original_price || product.price, // Store original price if provided
            discount_percent: product.discount_percent || 0, // Product's built-in discount
            discount_amount: product.discount_amount || null, // Additional voucher discount
            quantity: product.quantity,
            create_at: new Date()
          }
        });
        invoiceProducts.push(invoiceProduct);
      }
      
      // Update product stock quantity (reduce stock)
      for (const product of products) {
        await this.prisma.product_variation.update({
          where: { 
            product_variation_id: product.product_variation_id 
          },
          data: {
            stock_quantity: {
              decrement: product.quantity
            }
          }
        });
      }
      
      // Log the use of voucher rather than trying to update it
      if (voucher_storage_id) {
        console.log(`Voucher with ID ${voucher_storage_id} was used in invoice ${invoice_id}`);
        
        try {
          // Try to manually execute SQL to mark voucher as used
          await this.prisma.$executeRaw`
            UPDATE Voucher_storage 
            SET is_used = 1
            WHERE voucher_storage_id = ${Number(voucher_storage_id)}
          `;
        } catch (updateError) {
          console.warn(`Could not mark voucher as used: ${updateError.message}`);
        }
      }
      
      return {
        ...invoice,
        invoice_products: invoiceProducts
      };
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  async updateInvoiceStatus(updateInvoiceStatusInput: UpdateInvoiceStatusInput) {
    try {
      const { invoice_id, order_status } = updateInvoiceStatusInput;
      
      const updatedInvoice = await this.prisma.invoice.update({
        where: { invoice_id },
        data: { 
          order_status: order_status.toString(),
          update_at: new Date()
        } as any,
        include: {
          user: true,
        }
      });
      
      return updatedInvoice;
    } catch (error) {
      throw new Error(`Failed to update invoice status: ${error.message}`);
    }
  }

  async getInvoicesByShop(getInvoicesInput: GetInvoicesByShopInput): Promise<InvoicePagination> {
    try {
      const { shop_id, order_status, page, limit } = getInvoicesInput;
      const skip = (page - 1) * limit;
      
      // Tìm tất cả đơn hàng có sản phẩm của shop
      const whereClause: any = {};
      
      if (order_status) {
        whereClause.order_status = order_status;
      }
      
      // Đếm tổng số đơn hàng thỏa điều kiện
      let countQuery = `
        SELECT COUNT(DISTINCT i.invoice_id) as count
        FROM Invoice i
        JOIN Cart c ON i.cart_id = c.cart_id
        JOIN Cart_Product cp ON c.cart_id = cp.cart_id
        JOIN Product_variation pv ON cp.product_variation_id = pv.product_variation_id
        JOIN Product p ON pv.product_id = p.product_id
        WHERE p.shop_id = ?
      `;
      
      const queryParams = [shop_id];
      
      if (order_status) {
        countQuery += ` AND i.order_status = ?`;
        queryParams.push(order_status);
      }
      
      const totalCountQuery = await this.prisma.$queryRawUnsafe(countQuery, ...queryParams);
      
      const countResult = totalCountQuery as unknown as { count: number }[];
      const totalCount = Number(countResult[0]?.count || 0);
      const totalPage = Math.ceil(totalCount / limit);
      
      // Lấy dữ liệu các đơn hàng
      let dataQuery = `
        SELECT DISTINCT i.*
        FROM Invoice i
        JOIN Cart c ON i.cart_id = c.cart_id
        JOIN Cart_Product cp ON c.cart_id = cp.cart_id
        JOIN Product_variation pv ON cp.product_variation_id = pv.product_variation_id
        JOIN Product p ON pv.product_id = p.product_id
        WHERE p.shop_id = ?
      `;
      
      const dataParams = [shop_id];
      
      if (order_status) {
        dataQuery += ` AND i.order_status = ?`;
        dataParams.push(order_status);
      }
      
      dataQuery += ` ORDER BY i.create_at DESC LIMIT ? OFFSET ?`;
      dataParams.push(String(limit), String(skip));
      
      const invoices = await this.prisma.$queryRawUnsafe(dataQuery, ...dataParams);
      
      return {
        data: invoices as any[],
        totalCount,
        totalPage
      };
    } catch (error) {
      throw new Error(`Failed to get invoices by shop: ${error.message}`);
    }
  }

  async getOutOfStockProducts(input: GetOutOfStockProductsInput) {
    try {
      const { shop_id, page, limit } = input;
      const skip = (page - 1) * limit;
      
      // Đếm số lượng sản phẩm hết hàng
      const totalCount = await this.prisma.product.count({
        where: {
          shop_id,
          status: 'out_of_stock',
        }
      });
      
      // Lấy số lượng sản phẩm theo biến thể hết hàng
      const variationCount = await this.prisma.product_variation.count({
        where: {
          product: {
            shop_id
          },
          status: 'out_of_stock'
        }
      });
      
      const totalItems = totalCount + variationCount;
      const totalPage = Math.ceil(totalItems / limit);
      
      // Lấy danh sách sản phẩm hết hàng
      const outOfStockProducts = await this.prisma.product.findMany({
        where: {
          shop_id,
          status: 'out_of_stock',
        },
        include: {
          product_images: true,
          category: true,
        },
        skip,
        take: limit,
      });
      
      // Lấy danh sách biến thể sản phẩm hết hàng
      const outOfStockVariations = await this.prisma.product_variation.findMany({
        where: {
          product: {
            shop_id
          },
          status: 'out_of_stock'
        },
        include: {
          product: {
            include: {
              product_images: true,
              category: true,
            }
          }
        },
        skip: Math.max(0, skip - totalCount),
        take: skip >= totalCount ? limit : Math.max(0, limit - (totalCount - skip)),
      });
      
      return {
        products: outOfStockProducts,
        variations: outOfStockVariations,
        totalCount: totalItems,
        totalPage
      };
    } catch (error) {
      throw new Error(`Failed to get out of stock products: ${error.message}`);
    }
  }

  async getInvoiceDetail(invoice_id: string) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { invoice_id },
        include: {
          user: true,
        }
      });
      
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoice_id} not found`);
      }
      
      // Lấy thông tin sản phẩm trong đơn hàng
      const cartProducts = await this.prisma.cart_Product.findMany({
        include: {
          product_variation: {
            include: {
              product: {
                include: {
                  shop: true,
                  product_images: {
                    where: { is_thumbnail: true },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });
      
      const products = cartProducts.map(cp => {
        const pv = cp.product_variation;
        const product = pv.product;
        const thumbnailUrl = product.product_images[0]?.image_url;
        
        return {
          product_variation_name: pv.product_variation_name,
          base_price: parseFloat(pv.base_price.toString()),
          percent_discount: parseFloat(pv.percent_discount.toString()),
          status: pv.status,
          product_name: product.product_name,
          shop_id: product.shop_id,
          shop_name: product.shop.shop_name,
          image_url: thumbnailUrl,
          quantity: cp.quantity
        };
      });
      
      return {
        invoice_id: invoice.invoice_id,
        payment_method: invoice.payment_method,
        payment_status: invoice.payment_status,
        order_status: (invoice as any).order_status,
        total_amount: parseFloat(invoice.total_amount.toString()),
        shipping_fee: parseFloat(invoice.shipping_fee.toString()),
        user_name: invoice.user.user_name,
        create_at: invoice.create_at,
        products
      };
    } catch (error) {
      throw new Error(`Failed to get invoice detail: ${error.message}`);
    }
  }
} 