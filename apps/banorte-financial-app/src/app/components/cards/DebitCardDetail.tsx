import React from 'react';
import { Card, Button } from '@banorte/ui';
import { Wallet, ArrowRight, TrendingUp } from 'lucide-react';

interface DebitCardDetailProps {
  available: number;
  accountName: string;
}

export function DebitCardDetail({ available, accountName }: DebitCardDetailProps) {
  return (
    <Card className="mb-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-banorte-gray">{accountName}</p>
            <p className="text-3xl font-bold text-banorte-dark">${available.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none">
            <TrendingUp size={16} className="mr-2" />
            Ver Rendimientos
          </Button>
          <Button className="flex-1 md:flex-none">
            Transferir
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

