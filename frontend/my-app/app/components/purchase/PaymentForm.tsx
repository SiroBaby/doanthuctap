"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GET_ADDRESS_BY_USER_ID, GET_USER_VOUCHERS_FOR_CHECKOUT } from "@/graphql/queries";
import { useQuery } from "@apollo/client";

// Define interfaces for the discount calculation
interface DiscountedProduct {
  product_variation_id: string;
  original_price: number;
  discounted_price: number;
  discount_amount: number;
}

interface DiscountResult {
  totalDiscount: number;
  discountedProducts: DiscountedProduct[];
}

interface PaymentFormProps {
  totalAmount: number;
  products: Array<{
    product_variation_id: string;
    price: number;
    quantity: number;
    shop_id: string;
  }>;
  onPlaceOrder: (orderData: OrderData) => Promise<boolean>;
  onVoucherSelect?: (discountAmount: number, discountedProducts: DiscountedProduct[]) => void;
}

export interface OrderData {
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    phone: string;
    note?: string;
  };
  addressId?: string;
  paymentMethod: "cod" | "banking";
  voucherStorageId?: string;
  discountedProducts?: DiscountedProduct[];
}

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

// Định nghĩa kiểu dữ liệu cho Address từ API
interface AddressData {
  __typename: string;
  address_id: string;
  full_name: string;
  address: string;
  phone: string;
  is_default: boolean;
  create_at: string | null;
  update_at: string | null;
  delete_at: string | null;
}

// Định nghĩa kiểu dữ liệu cho Voucher
interface VoucherDetails {
  id: number;
  code: string;
  discount_percent: number;
  minimum_require_price: number;
  max_discount_price: number;
  quantity: number;
  max_use_per_user: number;
  valid_from: string;
  valid_to: string;
  create_at: string;
  delete_at: string | null;
  shop_id?: string; // Optional as it only exists on shop_voucher
}

interface UserVoucher {
  voucher_storage_id: number;
  user_id: string;
  voucher_id: string;
  voucher_type: 'voucher' | 'shop_voucher';
  claimed_at: string;
  voucher: VoucherDetails | null;
  shop_voucher: VoucherDetails | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  products,
  onPlaceOrder,
  onVoucherSelect,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OrderData>({
    customerInfo: {
      fullName: "",
      email: "",
      phone: "",
    },
    shippingAddress: {
      address: "",
      phone: "",
      note: "",
    },
    paymentMethod: "cod",
  });

  // Trạng thái cho việc chọn địa chỉ
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  
  // Trạng thái cho việc chọn voucher
  const [availableVouchers, setAvailableVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);

  // Modal state for voucher details
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<UserVoucher | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const checkoutData = sessionStorage.getItem("checkoutData");
  const checkoutDataJson = JSON.parse(checkoutData || "{}");
  const userid = checkoutDataJson.userId;
  const shopId = checkoutDataJson.shopId;

  const { data: addressData } = useQuery(GET_ADDRESS_BY_USER_ID, {
    variables: { id: userid },
  });

  const { data: voucherData } = useQuery(GET_USER_VOUCHERS_FOR_CHECKOUT, {
    variables: { userId: userid, shopId: shopId },
  });

  useEffect(() => {
    if (addressData && addressData.addressByUserId && addressData.addressByUserId.address) {
      // Biến đổi dữ liệu từ API thành định dạng SavedAddress
      const transformedAddresses = addressData.addressByUserId.address.map((addr: AddressData) => ({
        id: addr.address_id.toString(), // Đảm bảo là string
        name: addr.full_name,
        address: addr.address,
        phone: addr.phone,
        isDefault: addr.is_default
      }));
      
      setSavedAddresses(transformedAddresses);
      
      // Chọn địa chỉ mặc định nếu có
      const defaultAddress = transformedAddresses.find((addr: SavedAddress) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData((prev) => ({
          ...prev,
          addressId: defaultAddress.id, // Important: Set the addressId field for the default address
          shippingAddress: {
            address: defaultAddress.address,
            phone: defaultAddress.phone,
            note: prev.shippingAddress.note,
          },
          customerInfo: {
            ...prev.customerInfo,
            fullName: defaultAddress.name,
            phone: defaultAddress.phone,
          },
        }));
      }
    }
  }, [addressData]);

  // Cập nhật vouchers từ API
  useEffect(() => {
    if (voucherData && voucherData.getUserVouchersForCheckout) {
      setAvailableVouchers(voucherData.getUserVouchersForCheckout);
    }
  }, [voucherData]);

  // Lấy thông tin chi tiết voucher dựa theo loại voucher
  const getVoucherDetails = (voucher: UserVoucher): VoucherDetails | null => {
    if (voucher.voucher_type === 'voucher' && voucher.voucher) {
      return voucher.voucher;
    } else if (voucher.voucher_type === 'shop_voucher' && voucher.shop_voucher) {
      return voucher.shop_voucher;
    }
    return null;
  };

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const handlePaymentMethodChange = (method: "cod" | "banking") => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    const selectedAddress = savedAddresses.find(
      (addr) => addr.id === addressId
    );
    if (selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        addressId: addressId,
        shippingAddress: {
          address: selectedAddress.address,
          phone: selectedAddress.phone,
          note: prev.shippingAddress.note,
        },
        customerInfo: {
          ...prev.customerInfo,
          fullName: selectedAddress.name,
          phone: selectedAddress.phone,
        },
      }));
    }
  };

  // Xử lý khi chọn voucher
  const handleVoucherSelect = (voucherStorageId: string | null) => {
    let discountAmount = 0;
    let discountedProducts: DiscountedProduct[] = [];
    
    // Convert voucherStorageId string to number or null
    const numericId = voucherStorageId ? Number(voucherStorageId) : null;
    
    // Nếu chọn voucher đã chọn, hủy chọn
    if (selectedVoucherId === numericId) {
      setSelectedVoucherId(null);
      setFormData((prev) => ({
        ...prev,
        voucherStorageId: undefined
      }));
    } else {
      setSelectedVoucherId(numericId);
      
      // Calculate discount if a voucher is selected
      const selectedVoucher = numericId 
        ? availableVouchers.find(v => v.voucher_storage_id === numericId)
        : null;
        
      if (selectedVoucher) {
        const discountResult = calculateVoucherDiscount(selectedVoucher);
        discountAmount = discountResult.totalDiscount;
        discountedProducts = discountResult.discountedProducts;
      }
      
      setFormData((prev) => ({
        ...prev,
        voucherStorageId: voucherStorageId || undefined
      }));
    }
    
    // Notify parent component about discount change with discounted products info
    if (onVoucherSelect) {
      onVoucherSelect(discountAmount, discountedProducts);
    }
  };

  // Format discount percent to display correctly (e.g. 0.5 -> 50%)
  const formatDiscountPercent = (percent: number): number => {
    return percent < 1 ? percent * 100 : percent;
  };

  // Tính số tiền giảm từ voucher
  const calculateVoucherDiscount = (voucher: UserVoucher): DiscountResult => {
    const voucherDetails = getVoucherDetails(voucher);
    if (!voucherDetails) return { totalDiscount: 0, discountedProducts: [] };
    
    let totalDiscount = 0;
    const discountedProducts: DiscountedProduct[] = [];
    
    // Make sure products is defined and is an array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return { totalDiscount: 0, discountedProducts: [] };
    }
    
    // For shop vouchers, only apply to products from that shop
    if (voucher.voucher_type === 'shop_voucher' && voucher.shop_voucher) {
      const shopId = voucher.shop_voucher.shop_id;
      const shopProducts = products.filter(p => p.shop_id === shopId);
      
      if (shopProducts.length === 0) {
        return { totalDiscount: 0, discountedProducts: [] };
      }
      
      // Calculate total price of products from this shop
      const shopTotalAmount = shopProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      // Calculate shop discount amount (respecting max_discount_price)
      const rawShopDiscount = shopTotalAmount * voucherDetails.discount_percent;
      const shopDiscount = Math.min(rawShopDiscount, voucherDetails.max_discount_price);
      
      totalDiscount = shopDiscount;
      
      // Distribute discount proportionally among shop products
      shopProducts.forEach(product => {
        const productTotal = product.price * product.quantity;
        const proportion = productTotal / shopTotalAmount;
        const productDiscount = shopDiscount * proportion;
        const discountedPrice = product.price - (productDiscount / product.quantity);
        
        discountedProducts.push({
          product_variation_id: product.product_variation_id,
          original_price: product.price,
          discounted_price: discountedPrice,
          discount_amount: productDiscount / product.quantity
        });
      });
    } 
    // For system vouchers, apply to all products
    else if (voucher.voucher_type === 'voucher' && voucher.voucher) {
      // Calculate system discount amount (respecting max_discount_price)
      const rawDiscount = totalAmount * voucherDetails.discount_percent;
      const systemDiscount = Math.min(rawDiscount, voucherDetails.max_discount_price);
      
      totalDiscount = systemDiscount;
      
      // Distribute discount proportionally among all products
      products.forEach(product => {
        const productTotal = product.price * product.quantity;
        const proportion = productTotal / totalAmount;
        const productDiscount = systemDiscount * proportion;
        const discountedPrice = product.price - (productDiscount / product.quantity);
        
        discountedProducts.push({
          product_variation_id: product.product_variation_id,
          original_price: product.price,
          discounted_price: discountedPrice,
          discount_amount: productDiscount / product.quantity
        });
      });
    }
    
    return { totalDiscount, discountedProducts };
  };

  // Tính tổng tiền sau khi áp dụng voucher
  const calculateFinalAmount = (): number => {
    if (selectedVoucherId === null) return totalAmount;
    
    const selectedVoucher = availableVouchers.find(v => v.voucher_storage_id === selectedVoucherId);
    if (!selectedVoucher) return totalAmount;
    
    const { totalDiscount } = calculateVoucherDiscount(selectedVoucher);
    return Math.max(0, totalAmount - totalDiscount);
  };

  // Check if a voucher is valid (not expired)
  const isVoucherValid = (voucher: UserVoucher): boolean => {
    const voucherDetails = getVoucherDetails(voucher);
    if (!voucherDetails) return false;

    const now = new Date();
    const validTo = new Date(voucherDetails.valid_to);
    const validFrom = new Date(voucherDetails.valid_from);

    // If voucher is deleted (delete_at is not null), it's invalid
    if (voucherDetails.delete_at) return false;

    return now >= validFrom && now <= validTo;
  };

  // Check if a voucher is eligible based on order amount
  const getVoucherEligibilityMessage = (voucher: UserVoucher): string | null => {
    const voucherDetails = getVoucherDetails(voucher);
    if (!voucherDetails) return "Voucher không hợp lệ";
    
    if (!isVoucherValid(voucher)) {
      return "Voucher đã hết hạn";
    }
    
    // If no products have been provided, we can only check if the voucher is valid
    if (!products || products.length === 0) {
      return null;
    }
    
    // For shop vouchers, check if there are eligible products from that shop
    if (voucher.voucher_type === 'shop_voucher' && voucher.shop_voucher) {
      const shopId = voucher.shop_voucher.shop_id;
      const shopProducts = products.filter(p => p.shop_id === shopId);
      
      if (shopProducts.length === 0) {
        return "Không có sản phẩm phù hợp với voucher này";
      }
      
      // Calculate shop products total
      const shopTotalAmount = shopProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      if (shopTotalAmount < voucherDetails.minimum_require_price) {
        return `Sản phẩm từ shop cần tối thiểu ${formatCurrency(voucherDetails.minimum_require_price)}`;
      }
    } else {
      // For system vouchers, check the total amount
      if (totalAmount < voucherDetails.minimum_require_price) {
        return `Đơn hàng cần tối thiểu ${formatCurrency(voucherDetails.minimum_require_price)}`;
      }
    }
    
    return null; // No message means voucher is eligible
  };

  // Show voucher details modal
  const openVoucherDetails = (voucher: UserVoucher) => {
    setSelectedVoucherForModal(voucher);
    setShowVoucherModal(true);
  };
  
  // Close voucher details modal
  const closeVoucherModal = () => {
    setShowVoucherModal(false);
  };

  // Effect to handle clicking outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeVoucherModal();
      }
    };

    if (showVoucherModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoucherModal]);

  // Replace the voucher dropdown with a custom dropdown
  const renderVoucherSection = () => {
    if (availableVouchers.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Mã giảm giá</h2>
        
        <div className="relative">
          <div className="w-full border border-gray-300 rounded overflow-hidden">
            <div 
              onClick={() => document.getElementById('voucherDropdown')?.classList.toggle('hidden')}
              className="p-3 cursor-pointer flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                {selectedVoucherId !== null ? 
                  (() => {
                    const selected = availableVouchers.find(v => v.voucher_storage_id === selectedVoucherId);
                    if (!selected) return '-- Chọn mã giảm giá --';
                    const details = getVoucherDetails(selected);
                    return details ? `${details.code} - Giảm ${formatDiscountPercent(details.discount_percent)}%` : '-- Chọn mã giảm giá --';
                  })() 
                  : '-- Chọn mã giảm giá --'
                }
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <div id="voucherDropdown" className="hidden border-t border-gray-300 max-h-60 overflow-y-auto">
              <div 
                onClick={() => {
                  handleVoucherSelect(null);
                  document.getElementById('voucherDropdown')?.classList.add('hidden');
                }}
                className="p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
              >
                <span className="font-medium">Không sử dụng voucher</span>
              </div>
              
              {availableVouchers.map((voucher) => {
                const voucherDetails = getVoucherDetails(voucher);
                if (!voucherDetails) return null;
                
                const eligibilityMessage = getVoucherEligibilityMessage(voucher);
                const isEligible = !eligibilityMessage;
                const discountPercent = (voucherDetails.discount_percent * 100).toFixed(0);
                
                return (
                  <div 
                    key={voucher.voucher_storage_id}
                    className={`border-t border-gray-100 ${!isEligible ? 'opacity-60' : ''}`}
                  >
                    <div className="p-3 flex justify-between items-center">
                      <div 
                        className={`cursor-pointer flex-1 ${!isEligible ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`} 
                        onClick={() => {
                          if (isEligible) {
                            handleVoucherSelect(String(voucher.voucher_storage_id));
                            document.getElementById('voucherDropdown')?.classList.add('hidden');
                          }
                        }}
                      >
                        <div className="font-medium">{voucherDetails.code}</div>
                        <div className="text-sm text-gray-600">
                          Giảm {discountPercent}% (tối đa {formatCurrency(voucherDetails.max_discount_price)})
                        </div>
                        {!isEligible && (
                          <div className="text-xs text-red-500 mt-1">
                            {eligibilityMessage}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openVoucherDetails(voucher);
                          document.getElementById('voucherDropdown')?.classList.add('hidden');
                          return false;
                        }}
                        className="ml-3 p-2 text-gray-500 hover:text-custom-red rounded-full hover:bg-red-50"
                        title="Xem chi tiết voucher"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Display selected voucher info */}
        {selectedVoucherId !== null && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            {(() => {
              const selectedVoucher = availableVouchers.find(v => v.voucher_storage_id === selectedVoucherId);
              if (!selectedVoucher) return null;
              
              const voucherDetails = getVoucherDetails(selectedVoucher);
                
              if (!voucherDetails) return null;
              
              const discountAmount = calculateVoucherDiscount(selectedVoucher).totalDiscount;
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Mã giảm giá:</span>
                    <span className="text-custom-red">{voucherDetails.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Giảm:</span>
                    <span>{formatDiscountPercent(voucherDetails.discount_percent)}% (tối đa {formatCurrency(voucherDetails.max_discount_price)})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Giá trị đơn tối thiểu:</span>
                    <span>{formatCurrency(voucherDetails.minimum_require_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hiệu lực đến:</span>
                    <span>{new Date(voucherDetails.valid_to).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 text-custom-red border-t border-gray-200 mt-2">
                    <span>Tiền giảm:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If there's a selected voucher, add the discounted product information
      const updatedFormData = {...formData};
      
      if (selectedVoucherId !== null) {
        const selectedVoucher = availableVouchers.find(v => v.voucher_storage_id === selectedVoucherId);
        if (selectedVoucher) {
          const { discountedProducts } = calculateVoucherDiscount(selectedVoucher);
          // The parent component's onPlaceOrder will need to handle this discounted product info
          updatedFormData.discountedProducts = discountedProducts;
        }
      }
      
      const success = await onPlaceOrder(updatedFormData);
      if (success) {
        router.push("/customer/user/purchase");
      } else {
        alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Địa chỉ giao hàng */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">
          Thông tin địa chỉ giao hàng
        </h2>

        {/* Phần chọn địa chỉ đã lưu */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Chọn địa chỉ đã lưu
            </h3>
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedAddressId === address.id && !useNewAddress
                      ? "border-custom-red bg-red-50"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressId === address.id && !useNewAddress}
                    onChange={() => handleAddressSelect(address.id)}
                    className="h-5 w-5 mt-1 text-custom-red focus:ring-custom-red"
                  />
                  <div className="ml-3">
                    <div className="font-medium">
                      {address.name} {address.isDefault && "(Mặc định)"}
                    </div>
                    <div className="text-sm text-gray-700">
                      SĐT: {address.phone}
                    </div>
                    <div className="text-sm text-gray-700">
                      {address.address}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vouchers */}
      {renderVoucherSection()}

      {/* Voucher details modal */}
      {showVoucherModal && selectedVoucherForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {(() => {
              const voucherDetails = getVoucherDetails(selectedVoucherForModal);
              if (!voucherDetails) return null;
              
              const eligibilityMessage = getVoucherEligibilityMessage(selectedVoucherForModal);
              const discountPercent = formatDiscountPercent(voucherDetails.discount_percent);
              
              return (
                <>
                  <div className="p-4 bg-custom-red text-white flex justify-between items-center">
                    <h3 className="text-lg font-bold">Chi tiết voucher</h3>
                    <button 
                      onClick={closeVoucherModal}
                      className="text-white hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-xl font-bold">{voucherDetails.code}</h4>
                        <p className="text-gray-500 text-sm">
                          {selectedVoucherForModal.voucher_type === "voucher" ? "Voucher hệ thống" : "Voucher cửa hàng"}
                        </p>
                      </div>
                      <div className="bg-custom-red text-white p-3 rounded text-center">
                        <div className="text-xl font-bold">{discountPercent}%</div>
                        <div className="text-xs">Giảm</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500">Mô tả</div>
                        <div className="font-medium">
                          Giảm {discountPercent}% tối đa {formatCurrency(voucherDetails.max_discount_price)} cho đơn hàng từ {formatCurrency(voucherDetails.minimum_require_price)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Thời gian sử dụng</div>
                        <div>
                          {new Date(voucherDetails.valid_from).toLocaleDateString('vi-VN')} - {new Date(voucherDetails.valid_to).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Số lượng</div>
                        <div>
                          {voucherDetails.quantity} voucher
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Trạng thái</div>
                        {eligibilityMessage ? (
                          <div className="text-yellow-500">
                            Chưa đủ điều kiện: {eligibilityMessage}
                          </div>
                        ) : (
                          <div className="text-green-500">
                            Có thể sử dụng
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={closeVoucherModal}
                        className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                      >
                        Đóng
                      </button>
                      
                      {!eligibilityMessage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVoucherSelect(String(selectedVoucherForModal.voucher_storage_id));
                            closeVoucherModal();
                            return false;
                          }}
                          className="flex-1 py-2 bg-custom-red text-white rounded hover:bg-red-700"
                        >
                          Áp dụng voucher
                        </button>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Phương thức thanh toán */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Phương thức thanh toán</h2>
        <div className="space-y-3">
          <label key="payment-cod" className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === "cod"}
              onChange={() => handlePaymentMethodChange("cod")}
              className="h-5 w-5 text-custom-red focus:ring-custom-red"
            />
            <div className="ml-3">
              <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
              <div className="text-sm text-gray-500">
                Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng
              </div>
            </div>
          </label>

          <label key="payment-banking" className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              checked={formData.paymentMethod === "banking"}
              onChange={() => handlePaymentMethodChange("banking")}
              className="h-5 w-5 text-custom-red focus:ring-custom-red"
            />
            <div className="ml-3">
              <div className="font-medium">Chuyển khoản ...</div>
              <div className="text-sm text-gray-500">
                Thông tin tài khoản sẽ được gửi sau khi đặt hàng
              </div>
            </div>
          </label>
        </div>
      </div>
      {/* Tổng cộng và nút đặt hàng */}
      <div className="bg-white rounded-lg shadow p-6">
        {selectedVoucherId !== null && (
          <div className="mb-4 pb-4 border-b">
            <div className="flex justify-between items-center">
              <span>Tạm tính:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-custom-red">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(totalAmount - calculateFinalAmount())}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center text-lg font-medium mb-6">
          <span>Tổng thanh toán:</span>
          <span className="text-custom-red">{formatCurrency(calculateFinalAmount())}</span>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-custom-red hover:bg-red-700 text-white font-medium rounded transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
