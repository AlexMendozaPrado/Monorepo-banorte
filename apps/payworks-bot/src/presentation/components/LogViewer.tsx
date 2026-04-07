'use client';

import React, { useState } from 'react';

interface LogViewerProps {
  title: string;
  tabs: { label: string; content: string }[];
}

export function LogViewer({ title, tabs }: LogViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-gray-100 bg-banorte-surface">
        <h2 className="font-semibold text-sm text-banorte-dark">{title}</h2>
      </div>
      <div className="flex border-b border-gray-100">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === idx ? 'text-banorte-red border-b-2 border-banorte-red' : 'text-banorte-secondary hover:text-banorte-dark'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-[#1E1E1E] p-4 overflow-auto">
        <pre className="text-[#D4D4D4] font-mono text-xs leading-relaxed whitespace-pre-wrap">
          {tabs[activeTab]?.content || ''}
        </pre>
      </div>
    </div>
  );
}
