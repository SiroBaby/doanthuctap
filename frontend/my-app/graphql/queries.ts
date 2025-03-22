import { gql } from '@apollo/client';

//query user
//query get users
export const GET_USERS = gql`
  query Users($page: Int!, $limit: Int!, $search: String!) {
    users(pagination: { page: $page, limit: $limit, search: $search }) {
      data {
        id_user
        user_name
        email
        status
      }
      totalCount
      totalPage
    }
  }
`;

//query get user by id
export const GET_USER_BY_ID = gql`
  query User($id: String!) {
    user(id: $id) {
        id_user
        user_name
        email
        password
        phone
        status
        role
        create_at
        update_at
    }
  }
`;

//query address
//query get address by user id
export const GET_ADDRESS_BY_USER_ID = gql`
  query AddressByUserId($id: String!) {
    addressByUserId(id: $id) {
      address {
          address_id
          full_name
          phone
          address
          id_user
          is_default
          create_at
          update_at
          delete_at
      }
    }
  }
`;
//query shop
//query get shops
export const GET_SHOPS = gql`
  query Shops($page: Int!, $limit: Int!, $search: String) {
      shops(pagination: { page: $page, limit: $limit, search: $search }) {
          totalCount
          totalPage
          data {
              shop_id
              id_user
              shop_name
              status
              location_id
          }
      }
  }
`;

//query get shop by id
export const GET_SHOP_BY_ID = gql`
    query Shop ($id: String!) {
        shop(id: $id) {
            shop_id
            id_user
            shop_name
            link
            status
            location_id
            create_at
            update_at
            delete_at
            shop_addresses {
                address_id
                shop_id
                address
                phone
                is_default
            }
            products {
                product_id
                product_name
                brand
                status
                product_images {
                    image_url
                    is_thumbnail
                }
            }
            user {
                id_user
                user_name
            }
            shop_vouchers {
                id
                code
                discount_percent
                valid_from
                valid_to
                minimum_require_price
                max_discount_price
            }
            location {
                location_id
                location_name
            }
        }
    }
`;

//query get shop id by user id
export const GET_SHOP_ID_BY_USER_ID = gql`
query GetShopIdByUserId($id: String!) {
    getShopIdByUserId(id: $id) {
        shop_id
    }
}
`;

//query get products by shop id
export const GET_PRODUCTS_BY_SHOP_ID = gql`
    query GetProductsByShopId($id: String!, $page: Int!, $limit: Int!, $search: String!) {
        getProductsByShopId(id: $id, pagination: { page: $page, limit: $limit, search: $search }) {
            totalCount
            totalPage
            data {
                product_id
                product_name
                brand
                status
            }
        }
    }
`;

//query category
//query get categories
export const GET_CATEGORIES = gql`
  query Categorys($page: Int!, $limit: Int!, $search: String) {
    categorys(pagination: { limit: $limit, page: $page, search: $search }) {
      totalCount
      totalPage
      data {
        category_id
        category_name
        create_at
        update_at
      }
    }
  }
`;

//query get category by id
export const GET_CATEGORY_BY_ID = gql`
    query Category($id: Int!) {
        category(id: $id) {
            category_id
            category_name
            create_at
            update_at
        }
    }
`;

//query product
//query get products
export const GET_PRODUCTS = gql`
  query Products($page: Int!, $limit: Int!, $search: String) {
      products(pagination: { page: $page, limit: $limit, search: $search }) {
          totalCount
          totalPage
          data {
              product_id
              product_name
              brand
              status
              shop {
                  shop_name
              }
              category {
                  category_name
              }
          }
      }
  }
`; 
//query get product by id
export const GET_PRODUCT_BY_ID = gql`
  query Product ($id: Int!) {
      product(id: $id) {
          product_id
          product_name
          brand
          status
          product_detail_id
          category {
              category_name
          }
          shop {
              shop_id
              id_user
              shop_name
              link
              status
              location_id
              create_at
              update_at
              delete_at
          }
          product_detail {
              product_detail_id
              description
              specifications
              create_at
              update_at
          }
          product_variations {
              product_variation_id
              product_variation_name
              base_price
              percent_discount
              stock_quantity
              status
              product_id
              create_at
              update_at
          }
          product_images {
              image_id
              product_id
              image_url
              is_thumbnail
              create_at
          }
      }
  }
`;

//query get product by slug
export const GET_PRODUCT_BY_SLUG = gql`
  query ProductBySlug ($slug: String!) {
      productBySlug(slug: $slug) {
          product_id
          product_name
          brand
          status
          product_detail_id
          category {
              category_name
          }
          shop {
              shop_id
              id_user
              shop_name
              link
              status
              location_id
              create_at
              update_at
              delete_at
              user {
                  user_name
                  avatar
              }
          }
          product_detail {
              product_detail_id
              description
              specifications
              create_at
              update_at
          }
          product_variations {
              product_variation_id
              product_variation_name
              base_price
              percent_discount
              stock_quantity
              status
              product_id
              create_at
              update_at
          }
          product_images {
              image_id
              product_id
              image_url
              is_thumbnail
              create_at
          }
      }
  }
`;

// query shop voucher
// query get shop vouchers
export const GET_SHOP_VOUCHERS = gql`
    query ShopVouchers($page: Int!, $limit: Int!, $search: String) {
        shopVouchers(paginationInput: { page: $page, limit: $limit, search: $search }) {
            totalCount
            totalPage
            data {
                id
                code
                discount_percent
                minimum_require_price
                max_discount_price
                quantity
                max_use_per_user
                valid_from
                valid_to
                create_at
                delete_at
                shop_id
            }
        }
    }
`;

// query voucher
// query get vouchers
export const GET_VOUCHERS = gql`
    query Vouchers ($page: Int!, $limit: Int!, $search: String) {
        vouchers(paginationInput: { page: $page, limit: $limit, search: $search }) {
            totalCount
            totalPage
            data {
                id
                code
                discount_percent
                minimum_require_price
                max_discount_price
                quantity
                valid_to
                delete_at
            }
        }
    }
`;

// query get voucher by id
export const GET_VOUCHER_BY_ID = gql`
    query Voucher ($id: Int!) {
        voucher(id: $id) {
            id
            code
            discount_percent
            minimum_require_price
            max_discount_price
            quantity
            max_use_per_user
            valid_from
            valid_to
            create_at
            delete_at
        }
    }
`;

// query get shop vouchers by shop id
export const GET_SHOP_VOUCHERS_BY_SHOP_ID = gql`
    query GetShopVouchersByShopId($shopId: String!, $page: Int!, $limit: Int!, $search: String) {
        getShopVouchersByShopId(shopId: $shopId, paginationInput: { page: $page, limit: $limit, search: $search }) {
            totalCount
            totalPage
            data {
                id
                code
                discount_percent
                minimum_require_price
                max_discount_price
                quantity
                max_use_per_user
                valid_from
                valid_to
                create_at
                delete_at
                shop_id
            }
        }
    }
`;

// query get shop voucher by id
export const GET_SHOP_VOUCHER_BY_ID = gql`
    query ShopVoucher($id: Int!) {
        shopVoucher(id: $id) {
            id
            code
            discount_percent
            minimum_require_price
            max_discount_price
            quantity
            max_use_per_user
            valid_from
            valid_to
            create_at
            delete_at
            shop_id
            shop {
                shop_id
                shop_name
            }
        }
    }
`;

// Query để lấy danh sách locations
export const GET_LOCATIONS = gql`
  query Locations {
    locations {
      location_id
      location_name
    }
  }
`;

// Query để lấy chi tiết một shop address
export const GET_SHOP_ADDRESS_BY_ID = gql`
  query ShopAddress($id: Int!) {
    shopAddress(id: $id) {
      address_id
      address
      phone
      shop_id
    }
  }
`;

// query get seller dashboard stats
export const GET_SELLER_DASHBOARD_STATS = gql`
  query GetSellerDashboardStats($shopId: String!) {
    getSellerDashboardStats(shopId: $shopId) {
      totalRevenue
      orderCount
      productCount
      averageRating
      monthlyRevenue {
        month
        revenue
      }
      productStatusCount {
        status
        count
      }
    }
  }
`;

// Query liên quan đến invoice
export const GET_INVOICES_BY_SHOP = gql`
  query GetInvoicesByShop($getInvoicesByShopInput: GetInvoicesByShopInput!) {
    getInvoicesByShop(getInvoicesByShopInput: $getInvoicesByShopInput) {
      data {
        invoice_id
        payment_method
        payment_status
        order_status
        total_amount
        shipping_fee
        id_user
        create_at
        update_at
        user {
          user_name
          email
          phone
        }
      }
      totalCount
      totalPage
    }
  }
`;

export const GET_INVOICE_DETAIL = gql`
  query GetInvoiceDetail($invoice_id: String!) {
    getInvoiceDetail(invoice_id: $invoice_id) {
      invoice_id
      payment_method
      payment_status
      order_status
      total_amount
      shipping_fee
      create_at
      user {
        user_name
        email
        phone
      }
      shipping_address {
        address
        phone
      }
      invoice_products {
        invoice_product_id
        product_name
        variation_name
        price
        quantity
        discount_percent
        product_variation_id
        product_variation {
          product {
            product_images {
              image_url
              is_thumbnail
            }
          }
        }
      }
    }
  }
`;

export const GET_OUT_OF_STOCK_PRODUCTS = gql`
  query GetOutOfStockProducts($getOutOfStockProductsInput: GetOutOfStockProductsInput!) {
    getOutOfStockProducts(getOutOfStockProductsInput: $getOutOfStockProductsInput) {
      products {
        product_id
        product_name
        brand
        status
        shop_id
        product_images {
          image_url
          is_thumbnail
        }
        category {
          category_name
        }
      }
      variations {
        product_variation_id
        product_variation_name
        base_price
        percent_discount
        stock_quantity
        status
        product {
          product_id
          product_name
          brand
          shop_id
          product_images {
            image_url
            is_thumbnail
          }
          category {
            category_name
          }
        }
      }
      totalCount
      totalPage
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats($shop_id: String!) {
    getDashboardStats(shop_id: $shop_id) {
      totalRevenue
      totalOrders
      totalProducts
      ordersByStatus {
        waiting_for_delivery
        processed
        delivery
        delivered
        canceled
      }
      revenueByMonth {
        month
        revenue
      }
      topSellingProducts {
        product_id
        product_name
        total_quantity
        total_revenue
        product {
          product_id
          product_name
          product_images {
            image_url
            is_thumbnail
          }
        }
      }
      recentOrders {
        invoice_id
        order_status
        total_amount
        create_at
        user {
          user_name
        }
      }
      lowStockProducts {
        product_id
        product_name
        status
        product_images {
          image_url
          is_thumbnail
        }
        product_variations {
          product_variation_id
          variation_name
          stock_quantity
        }
      }
    }
  }
`;

// query get cart
export const GET_CART = gql`
query Getcart ($id: String!) {
    getcart(id: $id) {
        cart_id
        id_user
        status
        create_at
        update_at
    }
}
`;

// query get cart products
export const GET_CART_PRODUCTS = gql`
query GetCartProducts($cart_id: String!) {
    getCartProducts(cart_id: $cart_id) {
        product_variation {
            product_variation_name
            base_price
            percent_discount
            product_variation_id
        }
        product {
            product_name
            shop {
                shop_name
                shop_id
            }
            product_images {
                image_id
                image_url
            }
        }
        quantity
        is_selected
        cart_product_id
    }
}
`;

//query get vouchers for checkout
export const GET_USER_VOUCHERS_FOR_CHECKOUT = gql`
  query GetUserVouchersForCheckout($userId: String!, $shopId: String!) {
    getUserVouchersForCheckout(userId: $userId, shopId: $shopId) {
      voucher_storage_id
      user_id
      voucher_id
      voucher_type
      claimed_at
      voucher {
        id
        code
        discount_percent
        minimum_require_price
        max_discount_price
        quantity
        max_use_per_user
        valid_from
        valid_to
        create_at
        delete_at
      }
      shop_voucher {
        id
        code
        discount_percent
        minimum_require_price
        max_discount_price
        quantity
        max_use_per_user
        valid_from
        valid_to
        create_at
        delete_at
        shop_id
      }
    }
  }
`;
