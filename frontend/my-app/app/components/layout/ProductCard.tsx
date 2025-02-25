"use client";
import Image from 'next/image';

interface ProductCardProps {
  id: number;
  name: string;
  image: string;
  tag?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, image, tag }) => {
  return (
    <article 
      key={id}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800 mb-2">{name}</h3>
        {tag && (
          <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
            {tag}
          </span>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
