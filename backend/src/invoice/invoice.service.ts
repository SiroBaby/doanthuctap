import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateInvoiceStatusInput } from './dto/update-invoice-status.input';
import { GetInvoicesByShopInput } from './dto/get-invoices-by-shop.input';
import { GetOutOfStockProductsInput } from './dto/get-out-of-stock-products.input';
import { GetAllInvoicesInput } from './dto/get-all-invoices.input';
import { Invoice, InvoicePagination, OrderStatus } from './entities/invoice.entity';
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
          order_status: OrderStatus.WAITING_FOR_DELIVERY,
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
      // Get the invoice data with user
      const invoice = await this.prisma.invoice.findUnique({
        where: { invoice_id },
        include: {
          user: true,
        }
      });
      
      if (!invoice) {
        throw new Error(`Invoice with ID ${invoice_id} not found`);
      }
      
      // Get shipping address if available
      const shippingAddress = invoice.shipping_address_id 
        ? await this.prisma.address.findUnique({
            where: { address_id: invoice.shipping_address_id }
          })
        : null;
      
      // Get invoice products
      const invoiceProducts = await this.prisma.invoice_Product.findMany({
        where: { invoice_id },
        include: {
          product_variation: {
            include: {
              product: {
                include: {
                  product_images: true
                }
              }
            }
          }
        }
      });
      
      // Format products for products field (legacy)
      const products = invoiceProducts.map(ip => {
        const pv = ip.product_variation;
        const product = pv?.product;
        const thumbnailUrl = product?.product_images.find(img => img.is_thumbnail)?.image_url 
          || product?.product_images[0]?.image_url;
        
        return {
          product_variation_name: pv?.product_variation_name || ip.variation_name,
          base_price: parseFloat((pv?.base_price || ip.price).toString()),
          percent_discount: parseFloat((pv?.percent_discount || ip.discount_percent).toString()),
          status: pv?.status || 'unknown',
          product_name: product?.product_name || ip.product_name,
          shop_id: product?.shop_id || '',
          shop_name: '',
          image_url: thumbnailUrl || '',
          quantity: ip.quantity
        };
      });
      
      return {
        invoice_id: invoice.invoice_id,
        payment_method: invoice.payment_method,
        payment_status: invoice.payment_status,
        order_status: invoice.order_status,
        total_amount: parseFloat(invoice.total_amount.toString()),
        shipping_fee: parseFloat(invoice.shipping_fee.toString()),
        user_name: invoice.user.user_name,
        address: shippingAddress?.address || '',
        phone: shippingAddress?.phone || invoice.user.phone || '',
        create_at: invoice.create_at,
        // New fields
        user: invoice.user,
        shipping_address: {
          address: shippingAddress?.address || '',
          phone: shippingAddress?.phone || invoice.user.phone || ''
        },
        products,
        invoice_products: invoiceProducts
      };
    } catch (error) {
      throw new Error(`Failed to get invoice detail: ${error.message}`);
    }
  }

  async getAllInvoices(getAllInvoicesInput: GetAllInvoicesInput): Promise<InvoicePagination> {
    try {
      const { page = 1, limit = 10, order_status, search } = getAllInvoicesInput;
      const skip = (page - 1) * limit;

      // Build the count query
      let countQuery = `
        SELECT COUNT(DISTINCT i.invoice_id) as total
        FROM Invoice i
        JOIN User u ON i.id_user = u.id_user
        WHERE 1=1
      `;
      
      const countParams: string[] = [];
      
      // Add filters to count query
      if (order_status) {
        countQuery += ` AND i.order_status = ?`;
        countParams.push(order_status);
      }
      
      if (search) {
        countQuery += ` AND (i.invoice_id LIKE ? OR u.user_name LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Execute count query
      const countResult = await this.prisma.$queryRawUnsafe(countQuery, ...countParams) as Array<{total: number}>;
      const totalCount = countResult[0]?.total ? Number(countResult[0].total) : 0;
      const totalPage = Math.ceil(totalCount / limit);

      // Build the data query
      let dataQuery = `
        SELECT
          i.invoice_id,
          i.payment_method,
          i.payment_status,
          i.order_status,
          i.total_amount,
          i.shipping_fee,
          i.id_user,
          i.shop_id,
          i.create_at,
          i.update_at,
          u.user_name,
          u.email,
          u.phone,
          s.shop_name
        FROM Invoice i
        JOIN User u ON i.id_user = u.id_user
        JOIN Shop s ON i.shop_id = s.shop_id
        WHERE 1=1
      `;
      
      const dataParams = [...countParams];
      
      // Add the same filters to data query
      if (order_status) {
        dataQuery += ` AND i.order_status = ?`;
      }
      
      if (search) {
        dataQuery += ` AND (i.invoice_id LIKE ? OR u.user_name LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        if (!order_status) {
          dataParams.push(searchTerm, searchTerm, searchTerm);
        }
      }
      
      dataQuery += ` ORDER BY i.create_at DESC LIMIT ? OFFSET ?`;
      dataParams.push(String(limit), String(skip));
      
      interface InvoiceRaw {
        invoice_id: string;
        payment_method: string;
        payment_status: string;
        order_status: string;
        total_amount: string | number;
        shipping_fee: string | number;
        id_user: string;
        shop_id: string;
        create_at: Date;
        update_at: Date;
        user_name: string;
        email: string;
        phone: string;
        shop_name: string;
      }
      
      interface AdminInvoice {
        invoice_id: string;
        payment_method: string;
        payment_status: string;
        order_status: string;
        total_amount: number;
        shipping_fee: number;
        id_user: string;
        shop_id: string;
        cart_id: string;
        create_at: Date;
        update_at: Date;
        user: {
          user_name: string;
          email: string;
          phone: string;
        };
        shop: {
          shop_name: string;
        };
      }
      
      const invoices = await this.prisma.$queryRawUnsafe(dataQuery, ...dataParams) as InvoiceRaw[];
      
      // Transform the raw result to match the expected format
      const formattedInvoices = invoices.map(invoice => ({
        invoice_id: invoice.invoice_id,
        payment_method: invoice.payment_method,
        payment_status: invoice.payment_status,
        order_status: invoice.order_status,
        total_amount: parseFloat(invoice.total_amount.toString()),
        shipping_fee: parseFloat(invoice.shipping_fee.toString()),
        id_user: invoice.id_user,
        shop_id: invoice.shop_id,
        cart_id: '', // Add an empty cart_id as it's required by GraphQL schema but not in the database
        create_at: invoice.create_at,
        update_at: invoice.update_at,
        user: {
          user_name: invoice.user_name,
          email: invoice.email,
          phone: invoice.phone
        },
        shop: {
          shop_name: invoice.shop_name
        }
      }));
      
      return {
        data: formattedInvoices as unknown as Invoice[],
        totalCount,
        totalPage
      };
    } catch (error) {
      throw new Error(`Failed to get all invoices: ${error.message}`);
    }
  }
} 