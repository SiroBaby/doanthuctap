import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateInvoiceStatusInput } from './dto/update-invoice-status.input';
import { GetInvoicesByShopInput } from './dto/get-invoices-by-shop.input';
import { GetOutOfStockProductsInput } from './dto/get-out-of-stock-products.input';
import { GetAllInvoicesInput } from './dto/get-all-invoices.input';
import { Invoice, InvoicePagination, OrderStatus, InvoiceProduct, ProductVariationDetail, SimpleProductImage, SimpleShop } from './entities/invoice.entity';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { GetInvoicesByUserIdInput } from './dto/get-invoices-by-user-id.input';

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
      
      // Automatically set payment_status to 'paid' when order_status is DELIVERY
      const updateData: any = { 
        order_status: order_status.toString(),
        update_at: new Date()
      };

      // If status is DELIVERY, set payment_status to paid
      if (order_status === OrderStatus.DELIVERED) {
        updateData.payment_status = 'paid';
      }
      
      const updatedInvoice = await this.prisma.invoice.update({
        where: { invoice_id },
        data: updateData,
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
    const {
      shop_id,
      order_status,
      page = 1,
      limit = 10,
      search,
      start_date,
      end_date,
      payment_method,
      min_amount,
      max_amount,
    } = getInvoicesInput;

    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      shop_id,
      order_status: order_status as OrderStatus,
      payment_method,
      ...(search && {
        OR: [
          { invoice_id: { contains: search } },
          { user: { user_name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      }),
      ...(start_date && end_date && {
        create_at: {
          gte: new Date(start_date),
          lte: new Date(end_date),
        },
      }),
      ...(min_amount && {
        total_amount: {
          gte: min_amount,
        },
      }),
      ...(max_amount && {
        total_amount: {
          lte: max_amount,
        },
      }),
    };

    const totalCount = await this.prisma.invoice.count({ where });
    const totalPage = Math.ceil(totalCount / limit);

    const invoices = await this.prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: true,
        shop: true,
        invoice_products: {
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
        }
      },
      orderBy: {
        create_at: 'desc',
      },
    });

    // Get shipping addresses for all invoices
    const shippingAddressIds = invoices
      .map(invoice => invoice.shipping_address_id)
      .filter((id): id is number => id !== null);

    const shippingAddresses = shippingAddressIds.length > 0
      ? await this.prisma.address.findMany({
          where: {
            address_id: {
              in: shippingAddressIds
            }
          }
        })
      : [];

    const shippingAddressMap = new Map(
      shippingAddresses.map(addr => [addr.address_id, addr])
    );

    const transformedInvoices = invoices.map((invoice): Invoice => {
      const shippingAddress = invoice.shipping_address_id
        ? shippingAddressMap.get(invoice.shipping_address_id)
        : null;

      const shop: SimpleShop = {
        shop_id: invoice.shop.shop_id,
        shop_name: invoice.shop.shop_name || '',
        id_user: invoice.shop.id_user,
        link: invoice.shop.link || undefined,
        status: invoice.shop.status,
        location_id: invoice.shop.location_id || undefined,
        create_at: invoice.shop.create_at || undefined,
        update_at: invoice.shop.update_at || undefined,
        delete_at: invoice.shop.delete_at || undefined,
      };

      return {
        invoice_id: invoice.invoice_id,
        payment_method: invoice.payment_method || undefined,
        payment_status: invoice.payment_status || undefined,
        order_status: invoice.order_status as OrderStatus,
        total_amount: Number(invoice.total_amount),
        shipping_fee: Number(invoice.shipping_fee),
        id_user: invoice.id_user,
        shop_id: invoice.shop_id,
        cart_id: '', // Required by GraphQL schema but not in DB
        user: invoice.user,
        shop,
        shipping_address: shippingAddress ? {
          address: shippingAddress.address,
          phone: shippingAddress.phone
        } : undefined,
        invoice_products: invoice.invoice_products.map(ip => ({
          invoice_product_id: String(ip.invoice_product_id),
          product_name: ip.product_name,
          variation_name: ip.variation_name,
          price: Number(ip.price),
          quantity: ip.quantity,
          discount_percent: Number(ip.discount_percent),
          discount_amount: ip.discount_amount ? Number(ip.discount_amount) : undefined,
          product_variation_id: ip.product_variation_id,
          product_variation: {
            product_variation_name: ip.product_variation.product_variation_name,
            base_price: Number(ip.product_variation.base_price),
            percent_discount: Number(ip.product_variation.percent_discount),
            status: ip.product_variation.status,
            product_images: ip.product_variation.product.product_images.map(img => ({
              image_url: img.image_url,
              is_thumbnail: img.is_thumbnail || false
            }))
          }
        })),
        create_at: invoice.create_at || undefined,
        update_at: invoice.update_at || undefined
      };
    });

    return {
      data: transformedInvoices,
      totalCount,
      totalPage,
    };
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
          invoice_products: {
            include: {
              product_variation: {
                include: {
                  product: {
                    include: {
                      product_images: true,
                      shop: true
                    }
                  }
                }
              }
            }
          }
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

      // Format invoice products to include product images
      const formattedInvoiceProducts = invoice.invoice_products.map(ip => ({
        invoice_product_id: ip.invoice_product_id,
        product_name: ip.product_name,
        variation_name: ip.variation_name,
        price: parseFloat(ip.price.toString()),
        quantity: ip.quantity,
        discount_percent: parseFloat(ip.discount_percent.toString()),
        discount_amount: ip.discount_amount ? parseFloat(ip.discount_amount.toString()) : undefined,
        product_variation_id: ip.product_variation_id,
        product_variation: {
          product_variation_name: ip.product_variation?.product_variation_name || ip.variation_name,
          base_price: parseFloat((ip.product_variation?.base_price || ip.price).toString()),
          percent_discount: parseFloat((ip.product_variation?.percent_discount || ip.discount_percent).toString()),
          status: ip.product_variation?.status || 'unknown',
          product_images: ip.product_variation?.product?.product_images?.map(img => ({
            image_url: img.image_url,
            is_thumbnail: img.is_thumbnail || false
          })) || []
        }
      }));

      // Format products for legacy support
      const products = invoice.invoice_products.map(ip => {
        const pv = ip.product_variation;
        const product = pv?.product;
        const thumbnailUrl = product?.product_images?.find(img => img.is_thumbnail)?.image_url
          || product?.product_images?.[0]?.image_url
          || '';

        return {
          product_variation_name: pv?.product_variation_name || ip.variation_name,
          base_price: parseFloat((pv?.base_price || ip.price).toString()),
          percent_discount: parseFloat((pv?.percent_discount || ip.discount_percent).toString()),
          status: pv?.status || 'unknown',
          product_name: product?.product_name || ip.product_name,
          shop_id: product?.shop_id || '',
          shop_name: product?.shop?.shop_name || '',
          image_url: thumbnailUrl,
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
        create_at: invoice.create_at,
        user: invoice.user,
        shipping_address: shippingAddress ? {
          address: shippingAddress.address,
          phone: shippingAddress.phone
        } : {
          address: '',
          phone: invoice.user.phone || ''
        },
        products,
        invoice_products: formattedInvoiceProducts
      };
    } catch (error) {
      console.error('Error getting invoice detail:', error);
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

  async getAdminDashboardStats() {
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalShops,
      totalUsers,
      orderStats,
      revenueByMonth,
      topSellingProducts,
      topShops,
      recentOrders,
    ] = await Promise.all([
      // Tổng doanh thu
      this.prisma.invoice.aggregate({
        _sum: {
          total_amount: true,
        },
        where: {
          order_status: 'DELIVERED',
        },
      }).then((result) => result._sum.total_amount || 0),

      // Tổng đơn hàng
      this.prisma.invoice.count(),

      // Tổng sản phẩm
      this.prisma.product.count(),

      // Tổng cửa hàng
      this.prisma.shop.count(),

      // Tổng người dùng
      this.prisma.user.count(),

      // Thống kê đơn hàng theo trạng thái
      this.prisma.invoice.groupBy({
        by: ['order_status'],
        _count: true,
      }).then((results) => {
        const stats = {
          waiting_for_delivery: 0,
          processed: 0,
          delivery: 0,
          delivered: 0,
          canceled: 0,
        };
        results.forEach((result) => {
          stats[result.order_status.toLowerCase()] = result._count;
        });
        return stats;
      }),

      // Doanh thu theo tháng
      this.prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(create_at, '%Y-%m') as month,
          SUM(total_amount) as revenue
        FROM Invoice
        WHERE order_status = 'DELIVERED'
        GROUP BY DATE_FORMAT(create_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `,

      // Top sản phẩm bán chạy
      this.prisma.invoice_Product.groupBy({
        by: ['product_variation_id'],
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
        where: {
          invoice: {
            order_status: 'DELIVERED',
          },
        },
      }).then(async (results) => {
        const productDetails = await Promise.all(
          results.map(async (result) => {
            const productVariation = await this.prisma.product_variation.findUnique({
              where: { product_variation_id: result.product_variation_id },
              include: {
                product: {
                  include: {
                    product_images: true,
                    shop: true,
                  },
                },
              },
            });

            if (!productVariation || !result._sum.quantity || !result._sum.price) {
              return null;
            }

            return {
              product_id: productVariation.product.product_id,
              product_name: productVariation.product.product_name,
              total_quantity: result._sum.quantity,
              total_revenue: Number(result._sum.price) * result._sum.quantity,
              product: productVariation.product,
            };
          })
        );

        return productDetails.filter((product): product is NonNullable<typeof product> => product !== null);
      }),

      // Top cửa hàng
      this.prisma.shop.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              products: true,
              invoices: true,
            },
          },
          invoices: {
            where: {
              order_status: 'DELIVERED',
            },
            select: {
              total_amount: true,
            },
          },
        },
        orderBy: {
          invoices: {
            _count: 'desc',
          },
        },
      }).then((shops) =>
        shops.map((shop) => ({
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          total_revenue: shop.invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0),
          total_orders: shop._count.invoices,
          total_products: shop._count.products,
          shop,
        }))
      ),

      // Đơn hàng gần đây
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: {
          create_at: 'desc',
        },
        include: {
          user: true,
          shop: true,
        },
      }),
    ]);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalShops,
      totalUsers,
      orderStats,
      revenueByMonth,
      topSellingProducts,
      topShops,
      recentOrders,
    };
  }

  async getInvoicesByUserId(getInvoicesByUserIdInput: GetInvoicesByUserIdInput): Promise<InvoicePagination> {
    try {
      const { userId, page, limit, status } = getInvoicesByUserIdInput;
      const skip = (page - 1) * limit;

      // Build where conditions
      const whereConditions: Prisma.InvoiceWhereInput = {
        id_user: userId
      };

      if (status) {
        whereConditions.order_status = status;
      }

      // Get total count
      const totalCount = await this.prisma.invoice.count({
        where: whereConditions,
      });

      const totalPage = Math.ceil(totalCount / limit);

      // Get invoices with pagination
      const invoices = await this.prisma.invoice.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
          create_at: 'desc',
        },
        include: {
          user: {
            select: {
              id_user: true,
              user_name: true,
              email: true,
              phone: true,
              password: true,
              role: true
            },
          },
          invoice_products: {
            include: {
              product_variation: {
                include: {
                  product: {
                    include: {
                      product_images: {
                        select: {
                          image_url: true,
                          is_thumbnail: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Get shipping addresses for all invoices
      const shippingAddressIds = invoices
        .map(invoice => invoice.shipping_address_id)
        .filter((id): id is number => id !== null);

      const shippingAddresses = shippingAddressIds.length > 0
        ? await this.prisma.address.findMany({
            where: {
              address_id: {
                in: shippingAddressIds
              }
            }
          })
        : [];

      const shippingAddressMap = new Map(
        shippingAddresses.map(addr => [addr.address_id, addr])
      );

      // Transform data to match GraphQL schema
      const transformedInvoices = invoices.map((invoice): Invoice => {
        const shippingAddress = invoice.shipping_address_id
          ? shippingAddressMap.get(invoice.shipping_address_id)
          : null;

        return {
          invoice_id: invoice.invoice_id,
          payment_method: invoice.payment_method || undefined,
          payment_status: invoice.payment_status || undefined,
          order_status: invoice.order_status as OrderStatus,
          total_amount: Number(invoice.total_amount),
          shipping_fee: Number(invoice.shipping_fee),
          id_user: invoice.id_user,
          cart_id: '', // Required by GraphQL schema
          shop_id: invoice.shop_id,
          user: invoice.user,
          shipping_address: shippingAddress ? {
            address: shippingAddress.address,
            phone: shippingAddress.phone
          } : undefined,
          invoice_products: invoice.invoice_products.map(ip => ({
            invoice_product_id: String(ip.invoice_product_id),
            product_name: ip.product_name,
            variation_name: ip.variation_name,
            price: Number(ip.price),
            quantity: ip.quantity,
            discount_percent: Number(ip.discount_percent),
            discount_amount: ip.discount_amount ? Number(ip.discount_amount) : undefined,
            product_variation_id: ip.product_variation_id,
            product_variation: {
              product_variation_name: ip.product_variation.product_variation_name,
              base_price: Number(ip.product_variation.base_price),
              percent_discount: Number(ip.product_variation.percent_discount),
              status: ip.product_variation.status,
              product_images: ip.product_variation.product.product_images.map(img => ({
                image_url: img.image_url,
                is_thumbnail: img.is_thumbnail || false
              }))
            }
          })),
          create_at: invoice.create_at || undefined,
          update_at: invoice.update_at || undefined
        };
      });

      return {
        data: transformedInvoices,
        totalCount,
        totalPage,
      };
    } catch (error) {
      throw new Error(`Failed to get invoices by user ID: ${error.message}`);
    }
  }
} 