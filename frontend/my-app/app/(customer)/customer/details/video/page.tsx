"use client";

import { useState, useEffect } from "react";
//import Image from 'next/image';
import { useRouter, useSearchParams } from "next/navigation";
import VideoPlayer from "@/app/components/layout/VideoPlayer ";
import VideoNavigation from "@/app/components/layout/VideoNavigation";
import LikeButton from "@/app/components/layout/LikeButton";

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  likes: number;
}

export default function VideoDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id");

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm giả lập để lấy dữ liệu video - thay thế bằng API thực tế
  const fetchVideoDetails = async (id: string) => {
    try {
      // Phản hồi API giả lập
      // Trong ứng dụng thực tế, đây sẽ là cuộc gọi API như:
      // const response = await fetch(`/api/videos/${id}`);
      // const data = await response.json();

      // mẫu video mô phỏng
      //cách chạy http://localhost:3000/customer/details/video?id=1 hoặc id=2 id=3
      const mockVideos: Video[] = [
        {
          id: "1",
          title: "Video Demo",
          description: "Video mẫu để kiểm tra tính năng của ứng dụng",
          url: "/video/videodemo.mp4", // Sử dụng video mẫu từ public/video/videodemo.mp4
          thumbnailUrl: "/logo/logodemo.png",
          likes: 1024,
        },
        {
          id: "2",
          title: "em họ t hòi 2013=))",
          description: "Cảnh xấu để đời",
          url: "/video/video1.mp4",
          thumbnailUrl: "/logo/logodemo.png",
          likes: 768,
        },
        {
          id: "3",
          title: "đại đại",
          description: "heheheheehheeh",
          url: "/video/video2.mp4",
          thumbnailUrl: "/logo/logodemo.png",
          likes: 2048,
        },
      ];

      const video = mockVideos.find((v) => v.id === id);

      if (!video) {
        throw new Error("Không tìm thấy video");
      }

      return video;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    if (!videoId) {
      setError("Không có ID video");
      setIsLoading(false);
      return;
    }

    const getVideoData = async () => {
      try {
        const video = await fetchVideoDetails(videoId);
        setCurrentVideo(video);
      } catch (err) {
        setError("Không thể tải chi tiết video");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getVideoData();
  }, [videoId]);

  const handleNavigate = (direction: "prev" | "next") => {
    const currentId = parseInt(videoId || "1");
    const newId =
      direction === "prev"
        ? Math.max(1, currentId - 1).toString()
        : (currentId + 1).toString();

    router.push(`/details/video?id=${newId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !currentVideo) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h1>
        <p className="text-gray-700">{error || "Không tìm thấy video"}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Trở về Trang Chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Component Trình Phát Video */}
        <div className="relative aspect-video w-full">
          <VideoPlayer url={currentVideo.url} />
        </div>

        {/* Thông Tin Video và Điều Khiển */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{currentVideo.title}</h1>
            <VideoNavigation
              onPrevious={() => handleNavigate("prev")}
              onNext={() => handleNavigate("next")}
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{currentVideo.description}</p>
            <LikeButton initialLikes={currentVideo.likes} />
          </div>
        </div>
      </div>
    </div>
  );
}
