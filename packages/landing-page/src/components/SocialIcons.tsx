import React from 'react';

export function SocialIcons() {
  return (
    <div className="fixed right-4 top-1/3 flex-col space-y-2 z-40 hidden lg:flex">
      {/* Oculto en mobile/tablet para evitar conflictos con chat */}
      <a
        href="#"
        className="w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Facebook"
      >
        <span className="font-bold text-gray-800">f</span>
      </a>
      <a
        href="#"
        className="w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Twitter/X"
      >
        <span className="font-bold text-gray-800">X</span>
      </a>
      <a
        href="#"
        className="w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-100 transition-colors"
        aria-label="YouTube"
      >
        <span className="font-bold text-gray-800">YT</span>
      </a>
      <a
        href="#"
        className="w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Instagram"
      >
        <span className="font-bold text-gray-800">IG</span>
      </a>
    </div>
  );
}
