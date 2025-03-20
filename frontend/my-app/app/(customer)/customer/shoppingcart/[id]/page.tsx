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

export interface CartItem {
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

  const { data: cartData, loading: cartLoading, error: cartError } = useQuery(GET_CART, {
    variables: { id: id?.toString() },
  });
  
  const cartId = cartData?.getcart?.cart_id;
  
  const { data: cartProductsData, loading: cartProductsLoading, error: cartProductsError } = useQuery(GET_CART_PRODUCTS, {
    variables: { cart_id: cartId },
    skip: !cartId,
  });

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

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
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

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => item.isSelected);
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    // Chuyển hướng đến trang thanh toán
    router.push("/customer/payment");
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

  if (isLoading) {
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
