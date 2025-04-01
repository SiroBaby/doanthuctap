"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";

/**
 * Interface định nghĩa cấu trúc dữ liệu của người dùng trong ứng dụng.
 * @property user_id - ID định danh duy nhất của người dùng
 * @property email - Địa chỉ email của người dùng
 * @property full_name - Họ và tên đầy đủ của người dùng
 * @property avatar_url - Đường dẫn tới ảnh đại diện (tùy chọn)
 */
interface User {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

/**
 * Interface định nghĩa cấu trúc của context người dùng.
 * @property user - Đối tượng User hiện tại hoặc null nếu chưa đăng nhập
 * @property setUser - Hàm để cập nhật thông tin người dùng
 * @property loading - Trạng thái đang tải thông tin người dùng
 */
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

/**
 * Tạo Context để quản lý và chia sẻ thông tin người dùng xuyên suốt ứng dụng.
 * Khởi tạo với giá trị mặc định:
 * - user: null (chưa có người dùng)
 * - setUser: hàm rỗng (sẽ được ghi đè bởi useState)
 * - loading: true (ban đầu đang trong trạng thái tải)
 */
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

/**
 * UserProvider - Component bao bọc để cung cấp Context người dùng cho toàn bộ ứng dụng.
 *
 * Component này tích hợp với Clerk để xác thực người dùng, chuyển đổi dữ liệu
 * từ Clerk sang định dạng User của ứng dụng và chia sẻ thông tin đó qua Context.
 *
 * @param children - Các component con được bao bọc bởi Provider
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Sử dụng hook useClerkUser để lấy thông tin người dùng từ Clerk
  const { user: clerkUser, isLoaded } = useClerkUser();

  // State để lưu trữ thông tin người dùng theo định dạng của ứng dụng
  const [user, setUser] = useState<User | null>(null);

  // State để theo dõi trạng thái đang tải thông tin người dùng
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook để đồng bộ hóa thông tin người dùng từ Clerk sang ứng dụng.
   * Chạy mỗi khi trạng thái isLoaded hoặc clerkUser thay đổi.
   */
  useEffect(() => {
    // Kiểm tra nếu dữ liệu từ Clerk đã được tải và có thông tin người dùng
    if (isLoaded && clerkUser) {
      // Chuyển đổi dữ liệu từ Clerk sang định dạng User của ứng dụng
      setUser({
        user_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        full_name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        avatar_url: clerkUser.imageUrl,
      });
    } else {
      // Nếu không có thông tin người dùng từ Clerk, đặt user thành null
      setUser(null);
    }
    // Đánh dấu quá trình tải thông tin đã hoàn tất
    setLoading(false);
  }, [isLoaded, clerkUser]);

  /**
   * Cung cấp Context với giá trị hiện tại cho tất cả các component con.
   * Bao gồm:
   * - user: thông tin người dùng hiện tại
   * - setUser: hàm để cập nhật thông tin người dùng
   * - loading: trạng thái đang tải
   */
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * useUser - Custom hook để truy cập thông tin người dùng từ bất kỳ component nào.
 *
 * Hook này giúp các component con dễ dàng truy cập vào thông tin người dùng
 * thông qua Context mà không cần truyền props qua nhiều cấp component.
 *
 * @throws Error nếu được sử dụng bên ngoài UserProvider
 * @returns Context chứa thông tin người dùng hiện tại
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
