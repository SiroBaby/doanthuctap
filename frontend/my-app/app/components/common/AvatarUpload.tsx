"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";

export default function AvatarUpload() {
  // const [avatar, setAvatar] = useState<string>("/default-avatar.png");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      toast.error("Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    setIsUploading(true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      // setAvatar(reader.result as string);
      setIsUploading(false);
      toast.success("Tải ảnh lên thành công");
    };
    reader.readAsDataURL(file);

    // In a real application, you would upload the file to your server here
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2 self-start">
        Ảnh đại diện
      </div>

      <div className="relative w-40 h-40">
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 rounded-full">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {/* <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full border-2 border-gray-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-avatar.png";
          }}
        /> */}
      </div>

      {/* Fixing the accessibility issue with proper labeling */}
      <div className="relative">
        <label htmlFor="avatar-upload" className="sr-only">
          Tải lên ảnh đại diện
        </label>
        <input
          type="file"
          id="avatar-upload"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg, image/png, image/gif"
          className="hidden"
          aria-label="Tải lên ảnh đại diện"
          title="Chọn ảnh đại diện"
        />

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="text-sm text-blue-600 hover:underline focus:outline-none"
          aria-controls="avatar-upload"
        >
          Thay đổi ảnh đại diện
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        Cho phép JPG, GIF hoặc PNG. <br />
        Kích thước tối đa 5MB.
      </div>
    </div>
  );
}
