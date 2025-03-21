import React from "react";
import Image from "next/image";
import { CartItem } from "@/app/(customer)/customer/shoppingcart/[id]/page";
interface CartItemsListProps {
  itemsByShop: Record<string, CartItem[]>;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (cartproductid: number, productvariationid: number) => void;
  onSelectItem: (itemId: string, isSelected: boolean) => void;
  onSelectAllItems: (shopId: string, isSelected: boolean) => void;
}

const CartItemsList: React.FC<CartItemsListProps> = ({
  itemsByShop,
  onQuantityChange,
  onRemoveItem,
  onSelectItem,
  onSelectAllItems,
}) => {
  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  return (
    <div className="space-y-6">
      {Object.entries(itemsByShop).map(([shopId, items]) => {
        const shopName = items[0]?.shopName || "Shop";
        const allSelected = items.every((item) => item.isSelected);

        return (
          <div key={shopId} className="bg-white rounded-lg shadow p-4">
            {/* Header cửa hàng */}
            <div className="flex items-center pb-4 border-b">
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAllItems(shopId, e.target.checked)}
                    className="w-5 h-5 text-custom-red"
                    aria-label={`Chọn tất cả sản phẩm từ ${shopName}`}
                    title={`Chọn tất cả sản phẩm từ ${shopName}`}
                  />
                  <span className="ml-3 font-medium">{shopName}</span>
                </label>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row">
                  {/* Checkbox + Hình ảnh + Thông tin sản phẩm */}
                  <div className="flex flex-1 mb-3 sm:mb-0">
                    <div className="flex items-start">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.isSelected}
                          onChange={(e) =>
                            onSelectItem(item.id, e.target.checked)
                          }
                          className="w-5 h-5 mt-1 text-custom-red"
                          aria-label={`Chọn sản phẩm ${item.name}`}
                          title={`Chọn sản phẩm ${item.name}`}
                        />
                        <span className="sr-only">
                          Chọn sản phẩm {item.name}
                        </span>
                      </label>
                    </div>

                    <div className="ml-3 flex">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder/product-default.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>

                      <div className="ml-4">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        {item.variation && (
                          <p className="text-xs text-gray-500 mt-1">
                            Phân loại: {item.variation}
                          </p>
                        )}
                        <div className="mt-1 flex items-center">
                          <span className="text-sm font-medium text-custom-red">
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Số lượng + Xóa */}
                  <div className="flex items-center justify-between sm:justify-end">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() =>
                          onQuantityChange(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                        title="Giảm số lượng"
                      >
                        -
                      </button>
                      <label
                        className="sr-only"
                        htmlFor={`quantity-${item.id}`}
                      >
                        Số lượng cho {item.name}
                      </label>
                      <input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          onQuantityChange(
                            item.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-12 text-center py-1 border-x"
                        aria-label={`Số lượng cho ${item.name}`}
                        title={`Số lượng cho ${item.name}`}
                      />
                      <button
                        onClick={() =>
                          onQuantityChange(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Tăng số lượng"
                        title="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(
                        parseInt(item.id),
                        parseInt(item.productId)
                      )}
                      className="ml-4 text-gray-400 hover:text-custom-red"
                      aria-label={`Xóa sản phẩm ${item.name}`}
                      title={`Xóa sản phẩm ${item.name}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="sr-only">Xóa sản phẩm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItemsList;
