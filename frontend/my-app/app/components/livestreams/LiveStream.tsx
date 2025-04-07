"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface LiveStreamProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  shopName: string;
  shopAvatarUrl: string;
  viewerCount: number;
  isLive: boolean;
}
const LiveStream: React.FC<LiveStreamProps> = ({
  id,
  title,
  // thumbnailUrl,
  shopName,
  // shopAvatarUrl,
  viewerCount,
  isLive,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/livestream/${id}`);
  };
  return (
    <div
      className="rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        {/* <img
          src={thumbnailUrl}
          alt={title}
          className="w-full aspect-video object-cover"
        /> */}

        {isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md flex items-center">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
            LIVE
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {viewerCount.toLocaleString()}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{title}</h3>

        <div className="mt-2 flex items-center">
          {/* <img
            src={shopAvatarUrl}
            alt={shopName}
            className="w-6 h-6 rounded-full mr-2 object-cover"
          /> */}
          <span className="text-xs text-gray-600">{shopName}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
