"use client";

import { useState } from "react";
import ProfileForm from "@/app/components/layout/ProfileForm";
//import ProfileTabs from "@/app/components/layout/ProfileTabs";
//import { UserTopBar } from '@/app/components/layout/UserTopBar';

export default function ProfilePage() {
  {
    /* , setActiveTab*/
  }
  const [activeTab] = useState("info");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-medium text-gray-800">
              Hồ Sơ Của Tôi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý thông tin hồ sơ để bảo mật tài khoản
            </p>
          </div>

          <div className="py-6">
            {/*<ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />*/}

            <div className="p-3">{activeTab === "info" && <ProfileForm />}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
