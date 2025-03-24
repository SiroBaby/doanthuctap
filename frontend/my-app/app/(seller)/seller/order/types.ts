export enum OrderStatus {
  WAITING_FOR_DELIVERY = 'WAITING_FOR_DELIVERY',
  PROCESSED = 'PROCESSED',
  DELIVERY = 'DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export interface InvoiceProduct {
  invoice_product_id: number;
  product_name: string;
  variation_name: string;
  price: number;
  quantity: number;
  discount_percent: number;
  product_variation_id: number;
  product_variation?: {
    product?: {
      product_images?: Array<{
        image_url: string;
        is_thumbnail: boolean;
      }>;
    };
  };
}

export interface ShippingAddress {
  address: string;
  phone: string;
}

export interface Invoice {
  invoice_id: string;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  id_user: string;
  create_at: string;
  update_at: string;
  user: {
    user_name: string;
    email: string;
    phone: string;
  };
  shipping_address?: ShippingAddress;
  invoice_products: InvoiceProduct[];
}

export interface InvoiceDetail extends Invoice {
  products: InvoiceProduct[];
  address: {
    address_id: string;
    address: string;
    phone: string;
  };
}

export interface OutOfStockProduct {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  category: {
    category_id: string;
    category_name: string;
  };
  variations?: Array<{
    product_variation_id: string;
    variation_name: string;
    price: number;
    quantity: number;
    image_url: string;
  }>;
} 