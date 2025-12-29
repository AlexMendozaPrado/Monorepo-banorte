import React, { useEffect } from 'react';
import { Modal, Button } from '@banorte/ui';
import { Share2, Trophy } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CelebrationModal({ isOpen, onClose }: CelebrationModalProps) {
  // In a real implementation, we would trigger confetti here
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="text-center py-4">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
          🎉
        </div>

        <h2 className="text-2xl font-bold text-banorte-dark mb-2">
          ¡Felicidades, María!
        </h2>
        <p className="text-banorte-gray mb-6">
          Has completado tu meta{' '}
          <strong className="text-banorte-dark">Vacaciones Cancún</strong>{' '}
          ahorrando <strong className="text-status-success">$20,000</strong>.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-banorte-gray italic border border-gray-100">
          "¡Increíble! Tu disciplina y constancia dieron frutos. ¿Lista para tu
          próxima meta?"
          <div className="mt-2 font-bold text-banorte-red not-italic">
            - Norma
          </div>
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={onClose}>
            Crear Nueva Meta
          </Button>
          <Button variant="outline" fullWidth>
            <Share2 size={16} className="mr-2" />
            Compartir Logro
          </Button>
        </div>
      </div>
    </Modal>
  );
}
