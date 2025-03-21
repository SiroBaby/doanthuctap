"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GET_ADDRESS_BY_USER_ID } from "@/graphql/queries";
import { useQuery } from "@apollo/client";

interface PaymentFormProps {
  totalAmount: number;
  onPlaceOrder: (orderData: OrderData) => Promise<boolean>;
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
  paymentMethod: "cod" | "banking";
}

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

// Định nghĩa kiểu dữ liệu cho Address từ API
interface ApiAddress {
  __typename: string;
  address_id: number;
  full_name: string;
  address: string;
  phone: string;
  is_default: boolean;
  create_at: string | null;
  update_at: string | null;
  delete_at: string | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  onPlaceOrder,
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
  // const [newAddressName, setNewAddressName] = useState("");
  // const [newAddressPhone, setNewAddressPhone] = useState("");

  const checkoutData = sessionStorage.getItem("checkoutData");
  const checkoutDataJson = JSON.parse(checkoutData || "{}");
  const userid = checkoutDataJson.userId;

  const { data: addressData } = useQuery(GET_ADDRESS_BY_USER_ID, {
    variables: { id: userid },
  });

  useEffect(() => {
    if (addressData && addressData.addressByUserId && addressData.addressByUserId.address) {
      // Biến đổi dữ liệu từ API thành định dạng SavedAddress
      const transformedAddresses = addressData.addressByUserId.address.map((addr: ApiAddress) => ({
        id: addr.address_id.toString(), // Chuyển address_id thành id và đảm bảo là string
        name: addr.full_name, // Tạo tên mặc định vì API không trả về name
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

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  // const handleInputChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  //   >,
  //   section: "customerInfo" | "shippingAddress"
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [name]: value,
  //     },
  //   }));
  // };

  // const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewAddressName(e.target.value);
  //   setFormData((prev) => ({
  //     ...prev,
  //     customerInfo: {
  //       ...prev.customerInfo,
  //       fullName: e.target.value,
  //     },
  //   }));
  // };

  // const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewAddressPhone(e.target.value);
  //   setFormData((prev) => ({
  //     ...prev,
  //     customerInfo: {
  //       ...prev.customerInfo,
  //       phone: e.target.value,
  //     },
  //     shippingAddress: {
  //       ...prev.shippingAddress,
  //       phone: e.target.value,
  //     },
  //   }));
  // };

  //chỗ này không biết nhe để tượng trưng é
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

  // const handleUseNewAddress = () => {
  //   setUseNewAddress(true);
  //   setSelectedAddressId("");
  //   setFormData((prev) => ({
  //     ...prev,
  //     shippingAddress: {
  //       address: "",
  //       phone: "",
  //       note: prev.shippingAddress.note,
  //     },
  //   }));
  //   setNewAddressName("");
  //   setNewAddressPhone("");
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onPlaceOrder(formData);
      if (success) {
        router.push("/customer/payment");
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
{/* 
              <label
                className={`flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  useNewAddress ? "border-custom-red bg-red-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  checked={useNewAddress}
                  onChange={handleUseNewAddress}
                  className="h-5 w-5 text-custom-red focus:ring-custom-red"
                />
                <div className="ml-3 font-medium">Thêm địa chỉ mới</div>
              </label> */}
            </div>
          </div>
        )}

        {/* Form địa chỉ mới */}
        {/* {(useNewAddress || savedAddresses.length === 0) && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
                value={newAddressName}
                onChange={handleNameChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
                aria-required="true"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={newAddressPhone}
                onChange={handlePhoneChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
                aria-required="true"
                placeholder="Ví dụ: +84901234567"
                pattern="^\+?[0-9]{1,4}[0-9]{6,14}$"
                title="Nhập số điện thoại hợp lệ (có thể bắt đầu bằng dấu + và mã quốc gia)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Có thể nhập với mã quốc gia (VD: +84901234567) hoặc không có mã
                quốc gia (VD: 0901234567)
              </p>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.shippingAddress.address}
                onChange={(e) => handleInputChange(e, "shippingAddress")}
                className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
                aria-required="true"
              />
            </div>
          </div>
        )} */}

        {/* <div className="mt-4">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            value={formData.shippingAddress.note}
            onChange={(e) => handleInputChange(e, "shippingAddress")}
            className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
            placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao,..."
          ></textarea>
        </div> */}
      </div>

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
        <div className="flex justify-between items-center text-lg font-medium mb-6">
          <span>Tổng thanh toán:</span>
          <span className="text-custom-red">{formatCurrency(totalAmount)}</span>
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
