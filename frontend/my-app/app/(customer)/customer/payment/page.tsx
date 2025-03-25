"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@apollo/client";
import { CREATE_INVOICE, REMOVE_PRODUCT_VARIATION_FROM_CART_PRODUCT } from "@/graphql/mutations";
import PaymentForm, { OrderData } from "@/app/components/purchase/PaymentForm";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/[id]/page";
import OrderSummary from "@/app/components/purchase/OrderSummary";
import { toast } from "react-hot-toast";

// Define the DiscountedProduct type if not available in PaymentForm export
interface DiscountedProduct {
  product_variation_id: string;
  original_price: number;
  discounted_price: number;
  discount_amount: number;
}

const Page = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  
  // Set up the create invoice mutation and remove cart product mutation
  const [createInvoice] = useMutation(CREATE_INVOICE);
  const [removeCartProduct] = useMutation(REMOVE_PRODUCT_VARIATION_FROM_CART_PRODUCT);

  useEffect(() => {
    // Lấy dữ liệu từ sessionStorage
    try {
      const checkoutDataString = sessionStorage.getItem('checkoutData');
      
      if (!checkoutDataString) {
        // Không có dữ liệu trong session, chuyển hướng về giỏ hàng
        toast.error("Không có sản phẩm để thanh toán");
        router.push("/customer/shoppingcart");
        return;
      }
      
      const checkoutData = JSON.parse(checkoutDataString);
      
      if (!checkoutData.items || checkoutData.items.length === 0) {
        // Không có sản phẩm, chuyển hướng về giỏ hàng
        toast.error("Không có sản phẩm để thanh toán");
        router.push("/customer/shoppingcart");
        return;
      }
      
      // Cập nhật state với dữ liệu từ session
      setCartItems(checkoutData.items);
      setSubtotal(checkoutData.subtotal || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu thanh toán:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
      router.push("/customer/shoppingcart");
    }
  }, [router]);

  // Phí vận chuyển mẫu (trong thực tế sẽ tính dựa trên địa chỉ và trọng lượng)
  const shippingFee = 30000;

  // Tổng cộng
  const totalAmount = subtotal + shippingFee;
  
  // Handle voucher selection
  const handleVoucherSelect = (amount: number, discountedProducts: DiscountedProduct[] = []) => {
    setDiscountAmount(amount);
    
    // Use discountedProducts in the invoice creation
    if (discountedProducts.length > 0) {
      console.log("Products with discounts:", discountedProducts);
      // This will be used later when creating the invoice
    }
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async (orderData: OrderData): Promise<boolean> => {
    console.log("Dữ liệu đơn hàng:", orderData);
    console.log("Shipping address details:", JSON.stringify(orderData.shippingAddress));
    console.log("Sản phẩm trong đơn hàng:", cartItems);

    if (!userId) {
      toast.error("Bạn cần đăng nhập để đặt hàng");
      return false;
    }

    try {
      // Hiển thị loading toast
      const loadingToast = toast.loading("Đang xử lý đơn hàng...");
      
      // Group items by shop
      const itemsByShop = cartItems.reduce((groups, item) => {
        const key = item.shopId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      }, {} as Record<string, CartItem[]>);
      
      // Process each shop's items as a separate invoice
      const invoicePromises = Object.entries(itemsByShop).map(([shopId, items]) => {
        // Calculate shop's subtotal
        const shopSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Calculate shop's proportion of the total order
        const proportion = shopSubtotal / subtotal;
        
        // Calculate shop's portion of the discount (proportional to its subtotal)
        const shopDiscount = discountAmount * proportion;
        
        // Make sure the shop discount isn't larger than the shop's subtotal
        const effectiveShopDiscount = Math.min(shopDiscount, shopSubtotal);
        
        // Calculate final amount for this shop
        const shopFinalAmount = Math.max(0, shopSubtotal - effectiveShopDiscount);
        
        console.log(`Shop ${shopId} calculations:`, {
          subtotal: shopSubtotal,
          proportion: proportion,
          allocatedDiscount: shopDiscount,
          effectiveDiscount: effectiveShopDiscount,
          finalAmount: shopFinalAmount
        });
        
        // Convert cart items to invoice product format with potential discounts
        const invoiceProducts = items.map(item => {
          // Find if this product has voucher discount information
          const discountedProduct = orderData.discountedProducts?.find(
            dp => dp.product_variation_id === item.productId
          );
          
          // Calculate the product's built-in discount percent (from original price to current price)
          const productOriginalDiscount = item.originalPrice > 0 ? 
            ((item.originalPrice - item.price) / item.originalPrice) * 100 : 0;
          
          // Voucher discount amount per product (if any)
          const voucherDiscountAmount = discountedProduct?.discount_amount || 0;
          
          // Final price after all discounts (original discount and voucher discount)
          const finalPrice = discountedProduct?.discounted_price || item.price;
          
          console.log(`Product ${item.name} price calculations:`, {
            originalPrice: item.originalPrice,
            priceAfterBuiltInDiscount: item.price,
            voucherDiscountAmount,
            finalPrice,
            productOriginalDiscount
          });
          
          return {
            product_variation_id: parseInt(item.productId, 10),
            product_name: item.name,
            variation_name: item.variation || "Default",
            original_price: item.originalPrice, // Store the true original price before any discounts
            price: finalPrice, // Final price after all discounts
            quantity: item.quantity,
            discount_percent: productOriginalDiscount, // The product's built-in discount percentage
            discount_amount: voucherDiscountAmount // The additional voucher discount amount
          };
        });
        
        // Create payload for the API
        const invoiceInput = {
          user_id: userId,
          shop_id: shopId,
          payment_method: orderData.paymentMethod.toUpperCase(), // Convert to uppercase for backend
          shipping_address_id: orderData.addressId ? parseInt(orderData.addressId, 10) : null,
          products: invoiceProducts,
          total_amount: shopFinalAmount, // Apply the proportionally distributed discount
          shipping_fee: shippingFee / Object.keys(itemsByShop).length,
          voucher_storage_id: orderData.voucherStorageId ? parseInt(orderData.voucherStorageId, 10) : null
        };
        
        console.log("Creating invoice with input:", invoiceInput);
        
        return createInvoice({
          variables: {
            createInvoiceInput: invoiceInput
          }
        });
      });
      
      // Wait for all invoices to be created
      await Promise.all(invoicePromises);
      
      // Xóa dữ liệu session sau khi đặt hàng thành công
      sessionStorage.removeItem('checkoutData');
      
      // Xóa sản phẩm đã mua khỏi giỏ hàng
      try {
        // Remove each cart item individually
        for (const item of cartItems) {
          try {
            await removeCartProduct({
              variables: { 
                cartproductid: parseInt(item.id, 10),
                productvariationid: parseInt(item.productId, 10)
              }
            });
          } catch (removeError) {
            console.error(`Error removing cart product ${item.id}:`, removeError);
          }
        }
        
        console.log("Đã xóa sản phẩm khỏi giỏ hàng");
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        // Không cần thông báo lỗi cho người dùng vì đơn hàng vẫn được tạo thành công
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      toast.success("Đặt hàng thành công!");

      // Sau khi tạo đơn hàng thành công, chuyển hướng đến trang đơn hàng của người dùng
      router.push("/customer/user/purchase");

      return true;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi đặt hàng");
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-red"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    router.push(`/customer/shoppingcart/${userId}`);
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg">Không có sản phẩm để thanh toán...</p>
        <p>Đang chuyển hướng về giỏ hàng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PaymentForm
            totalAmount={totalAmount}
            products={cartItems.map(item => ({
              product_variation_id: item.productId,
              price: item.price,
              quantity: item.quantity,
              shop_id: item.shopId
            }))}
            onPlaceOrder={handlePlaceOrder}
            onVoucherSelect={handleVoucherSelect}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            totalAmount={totalAmount}
            discountAmount={discountAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
