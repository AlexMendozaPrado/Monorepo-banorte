'use client';

import React from 'react';
import { Card } from '@banorte/ui';
import { BookOpen, PlayCircle, HelpCircle } from 'lucide-react';

export function EducationSection() {
  const articles = [
    {
      title: '¿Qué es el deducible y coaseguro?',
      type: 'article',
      readTime: '3 min',
    },
    {
      title: 'Mitos sobre los seguros de vida',
      type: 'video',
      readTime: '5 min',
    },
    {
      title: 'Guía para asegurar tu primer auto',
      type: 'article',
      readTime: '4 min',
    },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-banorte-red" size={20} />
        <h3 className="font-bold text-banorte-dark">Educación sobre Seguros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-banorte-gray bg-gray-100 px-2 py-1 rounded">
                {item.type === 'video' ? 'Video' : 'Artículo'}
              </span>
              <span className="text-xs text-gray-400">{item.readTime}</span>
            </div>
            <h4 className="font-bold text-sm text-banorte-dark mb-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1 text-xs text-banorte-red font-medium">
              {item.type === 'video' ? (
                <PlayCircle size={14} />
              ) : (
                <BookOpen size={14} />
              )}
              <span>Ver contenido</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="font-bold text-sm text-banorte-dark mb-3 flex items-center gap-2">
          <HelpCircle size={16} /> Preguntas Frecuentes
        </h4>
        <div className="space-y-2">
          <details className="group">
            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm">
              <span>¿Puedo cancelar mi seguro en cualquier momento?</span>
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <p className="text-gray-500 mt-3 group-open:animate-fadeIn text-sm">
              Sí, puedes cancelar tu póliza cuando lo desees. Dependiendo de las
              condiciones, podrías recibir un reembolso de la prima no
              devengada.
            </p>
          </details>
        </div>
      </div>
    </Card>
  );
}

