"use client";

import { motion } from "framer-motion"; //npm install framer-motion này để thêm animation hoi
import Image from "next/image";

interface VideoNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

export default function VideoNavigation({
  onPrevious,
  onNext,
}: VideoNavigationProps) {
  return (
    <div className="flex space-x-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPrevious}
        className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-gray-200 shadow-sm"
      >
        <Image
          src="/icon/left-arrow.png"
          alt="Trước"
          width={24}
          height={24}
          className="object-contain"
        />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNext}
        className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-gray-200 shadow-sm"
      >
        <Image
          src="/icon/right-arrow.png"
          alt="Tiếp"
          width={24}
          height={24}
          className="object-contain"
        />
      </motion.button>
    </div>
  );
}
