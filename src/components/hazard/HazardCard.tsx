// src/components/hazard/HazardCard.tsx
import React from 'react';

interface HazardCardProps {
  title: string;
  image: string;
  description: string;
  onClick: () => void;
}

export function HazardCard({ title, image, description, onClick }: HazardCardProps) {
  return (
    <div 
      className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}