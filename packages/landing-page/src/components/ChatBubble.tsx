'use client';

import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Chat Window - Similar dimensions to ChatWidget */}
      {isOpen && (
        <div
          className="fixed bottom-5 right-5 bg-white rounded-3xl shadow-2xl z-[1300] flex flex-col overflow-hidden"
          style={{
            width: 'min(420px, calc(100vw - 40px))',
            height: 'min(600px, calc(100vh - 100px))',
          }}
        >
          {/* Header */}
          <div className="bg-[#EB0029] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold">Asistente Maya</h3>
            </div>
            <button
              onClick={handleToggle}
              className="hover:bg-white/10 rounded-full p-1.5 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 flex flex-col items-center justify-center text-center">
            <div className="max-w-xs">
              <p className="text-4xl mb-4">👋</p>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                ¡Hola! Soy Maya
              </h4>
              <p className="text-gray-600 mb-4">
                Tu asistente virtual de Banorte. Puedo ayudarte con:
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#EB0029] font-bold">•</span>
                  <span>Consultas sobre productos bancarios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EB0029] font-bold">•</span>
                  <span>Análisis de documentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EB0029] font-bold">•</span>
                  <span>Soporte general</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500">
                Inicia sesión para comenzar a chatear
              </p>
            </div>
          </div>

          {/* Footer - Input placeholder */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-400 text-sm">
              <span>Escribe tu mensaje...</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-5 right-5 w-14 h-14 bg-[#EB0029] hover:bg-[#c7001f] text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 z-[1200]"
          aria-label="Abrir chat con Maya"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
