"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    district: string;
    city: string;
    phone: string;
    note?: string;
  };
  paymentMethod: "cod" | "banking";
}

interface SavedAddress {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  isDefault: boolean;
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
      district: "",
      city: "",
      phone: "",
      note: "",
    },
    paymentMethod: "cod",
  });

  // Trạng thái cho việc chọn địa chỉ
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressPhone, setNewAddressPhone] = useState("");

  // Fetch địa chỉ đã lưu của khách hàng
  useEffect(() => {
    // Trong thực tế, sẽ gọi API để lấy danh sách địa chỉ của khách hàng
    const mockAddresses: SavedAddress[] = [
      {
        id: "addr1",
        name: "Nhà riêng",
        address: "123 Đường Nguyễn Văn A",
        district: "Quận 1",
        city: "TP HCM",
        phone: "+84901234567",
        isDefault: true,
      },
      {
        id: "addr2",
        name: "Công ty",
        address: "456 Đường Lê Lợi",
        district: "Quận 3",
        city: "TP HCM",
        phone: "+84909876543",
        isDefault: false,
      },
      {
        id: "addr3",
        name: "Nhà bạn",
        address: "789 Đường Trần Hưng Đạo",
        district: "Quận 5",
        city: "TP HCM",
        phone: "+84912345678",
        isDefault: false,
      },
    ];

    setSavedAddresses(mockAddresses);
    // Chọn địa chỉ mặc định nếu có
    const defaultAddress = mockAddresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          address: defaultAddress.address,
          district: defaultAddress.district,
          city: defaultAddress.city,
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
  }, []);

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    section: "customerInfo" | "shippingAddress"
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddressName(e.target.value);
    setFormData((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        fullName: e.target.value,
      },
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddressPhone(e.target.value);
    setFormData((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        phone: e.target.value,
      },
      shippingAddress: {
        ...prev.shippingAddress,
        phone: e.target.value,
      },
    }));
  };

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
          district: selectedAddress.district,
          city: selectedAddress.city,
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

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId("");
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        address: "",
        district: "",
        city: "",
        phone: "",
        note: prev.shippingAddress.note,
      },
    }));
    setNewAddressName("");
    setNewAddressPhone("");
  };

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
                      {address.address}, {address.district}, {address.city}
                    </div>
                  </div>
                </label>
              ))}

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
              </label>
            </div>
          </div>
        )}

        {/* Form địa chỉ mới */}
        {(useNewAddress || savedAddresses.length === 0) && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quận/Huyện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  required
                  value={formData.shippingAddress.district}
                  onChange={(e) => handleInputChange(e, "shippingAddress")}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange(e, "shippingAddress")}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-custom-red focus:border-custom-red"
                  aria-required="true"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
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
        </div>
      </div>

      {/* Phương thức thanh toán */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Phương thức thanh toán</h2>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
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

          <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
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
