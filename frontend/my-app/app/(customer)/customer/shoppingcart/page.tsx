"use client";

import React, { useState, useEffect } from "react";
//import Image from "next/image";
import { useRouter } from "next/navigation";
import CartItemsList from "@/app/components/cart/CartItemsList";
import CartSummary from "@/app/components/cart/CartSummary";
import EmptyCart from "@/app/components/cart/EmptyCart";

// dữ liệu test
const cartItemsMock = [
  {
    id: "item1",
    productId: "p1",
    name: "Áo thun cotton nam nữ form rộng",
    price: 150000,
    originalPrice: 200000,
    quantity: 2,
    image: "/placeholder/product1.jpg",
    variation: "Trắng, XL",
    isSelected: true,
    shopId: "shop1",
    shopName: "Shop ABC",
  },
  {
    id: "item2",
    productId: "p2",
    name: "Quần jean nam baggy",
    price: 350000,
    originalPrice: 350000,
    quantity: 1,
    image: "/placeholder/product2.jpg",
    variation: "Xanh đậm, 32",
    isSelected: true,
    shopId: "shop1",
    shopName: "Shop ABC",
  },
  {
    id: "item3",
    productId: "p3",
    name: "Giày thể thao nam nữ",
    price: 450000,
    originalPrice: 500000,
    quantity: 1,
    image: "/placeholder/product3.jpg",
    variation: "Đen, 40",
    isSelected: false,
    shopId: "shop2",
    shopName: "Shop XYZ",
  },
];

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
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Smô phỏng call API
    setTimeout(() => {
      setCartItems(cartItemsMock);
      setIsLoading(false);
    }, 700);
  }, []);

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
