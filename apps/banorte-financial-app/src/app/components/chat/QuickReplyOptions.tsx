import React from 'react'

interface QuickReplyOptionsProps {
  options: string[]
  onSelect: (option: string) => void
}

export function QuickReplyOptions({
  options,
  onSelect,
}: QuickReplyOptionsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 px-4">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          className="bg-white border border-banorte-red text-banorte-red hover:bg-red-50 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
        >
          {option}
        </button>
      ))}
    </div>
  )
}

