"use client";
import React, { useState, useEffect } from "react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

const SellerTopBar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  const { user } = useUser();
  const [userName, setUserName] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  const handleToggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-32 bg-admin-nav dark:bg-dark-sidebar dark:text-dark-text transition-colors duration-200">
      <nav className="flex justify-between items-center h-full px-12">
        <div className="lg:hidden flex items-center">
          <MenuIcon className="cursor-pointer" onClick={onToggleSidebar} />
        </div>
        <div className="flex items-center">
          <h1 className="text-4xl font-bold">Seller</h1>
        </div>
        <div className="flex items-center gap-6">

          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={handleToggleDarkMode}
          >
            {theme === 'dark' ? (
              <LightModeIcon className="h-6 w-6" />
            ) : (
              <DarkModeIcon className="h-6 w-6" />
            )}
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-lg">Hi, {userName}</span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SellerTopBar;
