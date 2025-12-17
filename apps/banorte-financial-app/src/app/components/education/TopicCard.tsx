'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface TopicCardProps {
  title: string;
  description: string;
  progress: number;
  lessonsCount: number;
  level: string;
  icon: React.ReactNode;
  color: string;
}

export function TopicCard({
  title,
  description,
  progress,
  lessonsCount,
  level,
  icon,
  color,
}: TopicCardProps) {
  return (
    <Card hoverEffect className="group cursor-pointer h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl ${color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
          {level}
        </span>
      </div>

      <h3 className="font-bold text-banorte-dark mb-2 group-hover:text-banorte-red transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-2">
        {description}
      </p>

      <div className="mt-auto">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{progress}% completado</span>
          <span>{lessonsCount} lecciones</span>
        </div>
        <ProgressBar value={progress} color="success" showLabel={false} />
      </div>
    </Card>
  );
}
