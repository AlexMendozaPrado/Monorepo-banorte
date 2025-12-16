import React from 'react';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

interface CardData {
  id: string;
  type: 'credit' | 'debit';
  name: string;
  number: string;
  network: 'visa' | 'mastercard';
  balance: number;
  limit?: number;
  color: string;
}

interface CardCarouselProps {
  cards: CardData[];
  activeCardIndex: number;
  onCardChange: (index: number) => void;
}

export function CardCarousel({ cards, activeCardIndex, onCardChange }: CardCarouselProps) {
  const handlePrev = () => {
    if (activeCardIndex > 0) onCardChange(activeCardIndex - 1);
  };
  const handleNext = () => {
    if (activeCardIndex < cards.length - 1) onCardChange(activeCardIndex + 1);
  };

  if (cards.length === 0) return null;

  return (
    <div className="relative w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={activeCardIndex === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={24} className="text-banorte-gray" />
        </button>

        <div className="w-72 h-44 perspective-1000 relative">
          <div
            className={`w-full h-full rounded-xl shadow-xl p-6 text-white relative overflow-hidden transition-all duration-500 transform ${cards[activeCardIndex].color}`}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg tracking-wider">BANORTE</span>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                  {cards[activeCardIndex].type === 'credit' ? 'Crédito' : 'Débito'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-7 bg-yellow-400/80 rounded flex items-center justify-center">
                  <div className="w-6 h-4 border border-yellow-600/50 rounded-sm" />
                </div>
                <CreditCard size={20} className="opacity-80" />
              </div>

              <div>
                <p className="font-mono text-xl tracking-widest mb-1 shadow-sm">
                  {cards[activeCardIndex].number}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] opacity-80 uppercase">Titular</p>
                    <p className="text-sm font-medium tracking-wide">MARÍA GONZÁLEZ</p>
                  </div>
                  <div className="font-bold italic text-lg opacity-90">
                    {cards[activeCardIndex].network === 'visa' ? 'VISA' : 'Mastercard'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={activeCardIndex === cards.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={24} className="text-banorte-gray" />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onCardChange(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeCardIndex ? 'w-6 bg-banorte-red' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

