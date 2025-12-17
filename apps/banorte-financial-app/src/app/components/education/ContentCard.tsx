'use client';

import React from 'react';
import { PlayCircle, BookOpen, Clock, Star } from 'lucide-react';

interface ContentCardProps {
  type: 'video' | 'article' | 'quiz';
  title: string;
  duration: string;
  rating: number;
  thumbnail: string;
  isRecommended?: boolean;
}

export function ContentCard({
  type,
  title,
  duration,
  rating,
  thumbnail,
  isRecommended,
}: ContentCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-video shadow-sm">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

        {isRecommended && (
          <div className="absolute top-2 left-2 bg-banorte-red text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            Recomendado
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
          <Clock size={10} />
          {duration}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-banorte-red shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            {type === 'video' ? (
              <PlayCircle size={20} />
            ) : (
              <BookOpen size={20} />
            )}
          </div>
        </div>
      </div>

      <h4 className="font-bold text-sm text-banorte-dark mb-1 line-clamp-2 group-hover:text-banorte-red transition-colors">
        {title}
      </h4>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="capitalize">{type}</span>
        <span>•</span>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star size={10} fill="currentColor" />
          <span>{rating}</span>
        </div>
      </div>
    </div>
  );
}
