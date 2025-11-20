'use client';

import React, { useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';

export function Promotion() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1920&h=1080&fit=crop',
      title: '¿ESTÁS LISTO PARA EL SORTEO?',
      subtitle: 'Con tus Tarjetas Banorte Visa',
      description: 'Participa para ganar boletos para partidos de la Copa Mundial de la FIFA 2026™'
    },
    {
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1920&h=1080&fit=crop',
      title: 'GANA INCREÍBLES PREMIOS',
      subtitle: 'Cortesía de Visa',
      description: 'Autos, premios en efectivo y experiencias inolvidables'
    },
    {
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop',
      title: 'TUS COMPRAS CUENTAN',
      subtitle: 'Cada transacción es una oportunidad',
      description: 'Mientras más uses tu tarjeta, más oportunidades de ganar'
    },
    {
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&h=1080&fit=crop',
      title: 'ÚNETE AL SORTEO',
      subtitle: 'No te pierdas esta oportunidad',
      description: 'Regístrate hoy y comienza a participar automáticamente'
    }
  ];

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="relative w-full h-screen -mx-4 md:-mx-0">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="h-screen">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-screen">
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-60" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-4xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-3xl font-semibold mb-6 text-[#E60026]">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg md:text-2xl max-w-3xl mb-8">
                    {slide.description}
                  </p>
                  <img src="/landingBanorte.png" alt="FIFA World Cup 2026" className="h-16 md:h-24 object-contain" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              current === index ? 'bg-[#E60026] w-8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
