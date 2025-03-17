"use client";

import React from "react";
import clsx from "clsx";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: "info", label: "Thông tin cá nhân" },
    { id: "security", label: "Bảo mật" },
    { id: "addresses", label: "Sổ địa chỉ" },
    { id: "notifications", label: "Thông báo" },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
