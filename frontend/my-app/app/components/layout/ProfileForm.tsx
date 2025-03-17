"use client";

import { useState, useEffect } from "react";
import InputField from "../forms/InputField";
import { RadioGroup } from "../forms/RadioGroup";
import { DatePicker } from "../forms/DatePicker";
import { Button } from "../common/Button";
import AvatarUpload from "../common/AvatarUpload";
import { toast } from "react-hot-toast";

interface ProfileFormData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
}

// Define a separate type for the form errors
interface ProfileFormErrors {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
}

export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "wq1qbzjqkw",
    fullName: "",
    email: "hy*******@gmail.com",
    phone: "",
    gender: "",
    birthDate: {
      day: "",
      month: "",
      year: "",
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowPhoneInput, setIsShowPhoneInput] = useState<boolean>(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  useEffect(() => {
    // Giả lập lấy dữ liệu từ API
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Trong thực tế, đây sẽ là một API call
        setTimeout(() => {
          setFormData({
            username: "wq1qbzjqkw",
            fullName: "Nguyễn Văn A",
            email: "hy*******@gmail.com",
            phone: "",
            gender: "male",
            birthDate: {
              day: "15",
              month: "08",
              year: "1990",
            },
          });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi người dùng nhập liệu
    if (errors[name as keyof ProfileFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleDateChange = (type: "day" | "month" | "year", value: string) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: {
        ...prev.birthDate,
        [type]: value,
      },
    }));

    // Xóa lỗi ngày sinh khi người dùng thay đổi
    if (errors.birthDate) {
      setErrors((prev) => ({
        ...prev,
        birthDate: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (formData.phone && !/^(0|\+84)[0-9]{9,10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    const { day, month, year } = formData.birthDate;
    if ((day || month || year) && (!day || !month || !year)) {
      newErrors.birthDate = "Vui lòng nhập đầy đủ ngày sinh";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsLoading(true);
    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Dữ liệu đã gửi:", formData);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPhoneInput = () => {
    setIsShowPhoneInput(true);
  };

  const handleChangeEmail = () => {
    toast.error("Chức năng đang được phát triển");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div className="md:col-span-2 space-y-6">
        <InputField
          label="Tên đăng nhập"
          name="username"
          value={formData.username}
          onChange={handleChange}
          readOnly
          helperText="Tên đăng nhập chỉ có thể thay đổi một lần."
        />

        <InputField
          label="Tên"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Nhập họ và tên"
          error={errors.fullName}
        />

        <InputField
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          readOnly
          endAdornment={
            <button
              type="button"
              className="text-blue-500 hover:underline text-sm"
              onClick={handleChangeEmail}
            >
              Thay Đổi
            </button>
          }
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          {!formData.phone && !isShowPhoneInput ? (
            <button
              type="button"
              className="text-blue-500 hover:underline text-sm text-left"
              onClick={handleShowPhoneInput}
            >
              Thêm
            </button>
          ) : (
            <InputField
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              error={errors.phone}
            />
          )}
        </div>

        <div>
          <RadioGroup
            label="Giới tính"
            name="gender"
            value={formData.gender}
            onChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                gender: value as "male" | "female" | "other",
              }));
              if (errors.gender) {
                setErrors((prev) => ({ ...prev, gender: undefined }));
              }
            }}
            options={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
              { value: "other", label: "Khác" },
            ]}
          />
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <DatePicker
            label="Ngày sinh"
            selectedDay={formData.birthDate.day}
            selectedMonth={formData.birthDate.month}
            selectedYear={formData.birthDate.year}
            onDayChange={(day) => handleDateChange("day", day)}
            onMonthChange={(month) => handleDateChange("month", month)}
            onYearChange={(year) => handleDateChange("year", year)}
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      <div className="md:col-span-1">
        <AvatarUpload />
      </div>
    </form>
  );
}
