"use client";

import React from "react";
//import Image from "next/image";

const Video = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-xs">
      <div className="relative h-25">
        {/*để tạm thay video*/}
        <video
          src="/video/videodemo.mp4"
          width={200}
          height={200}
          className="w-full h-full object-cover"
        ></video>
      </div>

      <div className="relative p-3 h-14">
        <p className="text-gray-800 font-medium">Áo phông trắng</p>
      </div>
    </div>
  );
};

export default Video;
