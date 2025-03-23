/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
//import Image from "next/image";
import { useRouter } from "next/navigation";
import CartItemsList from "@/app/components/cart/CartItemsList";
import CartSummary from "@/app/components/cart/CartSummary";
import EmptyCart from "@/app/components/cart/EmptyCart";
import { useParams } from "next/navigation";
import { GET_CART, GET_CART_PRODUCTS } from "@/graphql/queries";
import { useQuery, useMutation } from "@apollo/client";
import { REMOVE_PRODUCT_VARIATION_FROM_CART_PRODUCT } from "@/graphql/mutations";
import { toast } from "react-hot-toast";

export interface CartItem{
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  variation?: string;
  isSelected: boolean;
  shopId: string;
  shopName: string;
}

const CartPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: cartData, loading: cartLoading, error: cartError, refetch: refetchCart } = useQuery(GET_CART, {
    variables: { id: id?.toString() },
    fetchPolicy: 'network-only', // Luôn lấy dữ liệu mới từ server
  });

  const [removeCartProduct, { loading: removeCartProductLoading, error: removeCartProductError }] = useMutation(REMOVE_PRODUCT_VARIATION_FROM_CART_PRODUCT);
  
  const cartId = cartData?.getcart?.cart_id;
  
  const { data: cartProductsData, loading: cartProductsLoading, error: cartProductsError, refetch: refetchCartProducts } = useQuery(GET_CART_PRODUCTS, {
    variables: { cart_id: cartId },
    skip: !cartId,
    fetchPolicy: 'network-only', // Luôn lấy dữ liệu mới từ server
  });

  // Refetch dữ liệu khi component mount
  useEffect(() => {
    if (id) {
      refetchCart();
    }
  }, [id, refetchCart]);

  // Refetch dữ liệu sản phẩm khi có cartId
  useEffect(() => {
    if (cartId) {
      refetchCartProducts();
    }
  }, [cartId, refetchCartProducts]);

  useEffect(() => {
    if (!cartProductsLoading && cartProductsData?.getCartProducts) {
      // Chuyển đổi dữ liệu từ response GraphQL sang định dạng CartItem[]
      const transformedItems = cartProductsData.getCartProducts.map((item: any) => ({
        id: item.cart_product_id.toString(),
        productId: item.product_variation.product_variation_id.toString(),
        name: item.product.product_name,
        price: item.product_variation.base_price * (1 - item.product_variation.percent_discount),
        originalPrice: item.product_variation.base_price,
        quantity: item.quantity,
        image: item.product.product_images?.[0]?.image_url || '',
        variation: item.product_variation.product_variation_name,
        isSelected: item.is_selected,
        shopId: item.product.shop.shop_id,
        shopName: item.product.shop.shop_name,
      }));
      
      setCartItems(transformedItems);
      setIsLoading(false);
    }
  }, [cartProductsData, cartProductsLoading]);

  if (!id) {
    return <div>Không tìm thấy ID giỏ hàng</div>;
  }

  if (cartError) {
    return <div>Có lỗi khi tải giỏ hàng: {cartError.message}</div>;
  }

  if (cartProductsError) {
    return <div>Có lỗi khi tải sản phẩm trong giỏ hàng: {cartProductsError.message}</div>;
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (cartproductid: number, productvariationid: number) => {
    // Show confirmation dialog
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return; // User canceled the operation
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Đang xóa sản phẩm...");
      
      // Call the mutation
      removeCartProduct({
        variables: {
          cartproductid: cartproductid,
          productvariationid: productvariationid,
        },
        onCompleted: () => {
          // Dismiss loading toast and show success
          toast.dismiss(loadingToast);
          toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
          
          // Remove the item immediately from the UI
          setCartItems((prevItems) => 
            prevItems.filter((item) => parseInt(item.id) !== cartproductid)
          );
          
          // Refetch dữ liệu để đảm bảo UI đồng bộ với server
          refetchCartProducts();
        },
        onError: (error) => {
          // Dismiss loading toast and show error
          toast.dismiss(loadingToast);
          toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
        }
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      console.error("Error removing item from cart:", error);
    }
  };

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isSelected } : item
      )
    );
  };

  const handleSelectAllItems = (shopId: string, isSelected: boolean) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.shopId === shopId ? { ...item, isSelected } : item
      )
    );
  };

  const handleCheckout = async () => {
    const selectedItems = cartItems.filter((item) => item.isSelected);
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    try {
      // Tính tổng tiền các sản phẩm được chọn
      const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Lấy shopId từ sản phẩm được chọn (giả định rằng tất cả sản phẩm từ cùng một shop)
      // Nếu có nhiều shop, chỉ lấy shopId đầu tiên cho đơn giản
      const shopId = selectedItems[0]?.shopId || '';
      
      // Chuẩn bị dữ liệu để lưu
      const checkoutData = {
        items: selectedItems,
        subtotal: subtotal,
        timestamp: new Date().toISOString(),
        userId: id,
        shopId: shopId
      };

      // Lưu dữ liệu vào sessionStorage để duy trì giữa các trang
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Hiển thị thông báo thành công
      toast.success("Đang chuyển đến trang thanh toán");
      
      // Chuyển hướng đến trang thanh toán
      router.push("/customer/payment");
    } catch (error) {
      console.error('Error saving to session:', error);
      toast.error('Có lỗi xảy ra khi chuẩn bị thanh toán. Vui lòng thử lại.');
    }
  };

  // Tính tổng số sản phẩm được chọn
  const selectedItemsCount = cartItems.filter((item) => item.isSelected).length;

  // Tính tổng tiền các sản phẩm được chọn
  const totalAmount = cartItems
    .filter((item) => item.isSelected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Nhóm các sản phẩm theo shop
  const itemsByShop = cartItems.reduce((groups, item) => {
    const group = groups[item.shopId] || [];
    group.push(item);
    groups[item.shopId] = group;
    return groups;
  }, {} as Record<string, CartItem[]>);

  if (isLoading || cartLoading || cartProductsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-red"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItemsList
            itemsByShop={itemsByShop}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            onSelectItem={handleSelectItem}
            onSelectAllItems={handleSelectAllItems}
          />
        </div>

        <div className="lg:col-span-1">
          <CartSummary
            selectedItemsCount={selectedItemsCount}
            totalAmount={totalAmount}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
