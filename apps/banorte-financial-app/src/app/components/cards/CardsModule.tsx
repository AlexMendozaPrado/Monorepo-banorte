'use client';

import React, { useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { useCards } from '../../hooks/useCards';
import { CardCarousel } from './CardCarousel';
import { CreditCardDetail } from './CreditCardDetail';
import { DebitCardDetail } from './DebitCardDetail';
import { SmartRecommendations } from './SmartRecommendations';
import { UsageStrategy } from './UsageStrategy';
import { BenefitsSection } from './BenefitsSection';
import { PaymentModal } from './PaymentModal';
import { TransactionList } from './TransactionList';
import { CardHealthScore } from './CardHealthScore';
import { Button } from '../ui/Button';

export default function CardsModule() {
  const { cards, activeCard, activeCardIndex, setActiveCardIndex, isLoading, error } = useCards();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-banorte-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-banorte-gray">Cargando tus tarjetas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-status-alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <CreditCard size={40} className="text-banorte-gray" />
        </div>
        <h2 className="text-2xl font-bold text-banorte-dark mb-2">No tienes tarjetas registradas</h2>
        <p className="text-banorte-gray mb-6">Agrega tu primera tarjeta para comenzar a gestionar tus finanzas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-banorte-dark">Mis Tarjetas</h1>
          <p className="text-banorte-gray">Gestiona tus tarjetas y optimiza tu crédito</p>
        </div>
        <Button size="sm" variant="outline">
          <Plus size={16} className="mr-2" />
          Agregar Tarjeta
        </Button>
      </div>

      <CardCarousel cards={cards} activeCardIndex={activeCardIndex} onCardChange={setActiveCardIndex} />

      <CardHealthScore />

      {activeCard?.type === 'credit' ? (
        <>
          <CreditCardDetail
            used={activeCard.balance}
            limit={activeCard.limit || 0}
            paymentDue={activeCard.paymentDue || '15 Nov'}
            minPayment={activeCard.minPayment || 450}
            noInterestPayment={activeCard.noInterestPayment || activeCard.balance}
            cutDate={activeCard.cutDate || '30 Oct'}
            onPay={() => setIsPaymentModalOpen(true)}
          />
          <SmartRecommendations
            userId="user-demo"
            cardId={activeCard.id}
            cardName={activeCard.name}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageStrategy />
            <BenefitsSection />
          </div>
        </>
      ) : (
        <>
          <DebitCardDetail available={activeCard?.balance || 0} accountName="Cuenta de Nómina" />
          <SmartRecommendations
            userId="user-demo"
            cardId={activeCard?.id}
            cardName={activeCard?.name || 'tu tarjeta'}
          />
        </>
      )}

      <TransactionList />

      {activeCard && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          cardName={activeCard.name}
          noInterestAmount={activeCard.noInterestPayment || activeCard.balance}
          minAmount={activeCard.minPayment || 450}
        />
      )}
    </div>
  );
}

