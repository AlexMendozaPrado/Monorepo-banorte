// cardsModule.ts - Dependency Injection for Cards Module
import { InMemoryCardRepository } from '../repositories/in-memory/InMemoryCardRepository';
import { OpenAICardOptimizer } from '../ai/providers/openai/OpenAICardOptimizer';
import { CreateCardUseCase } from '../../core/application/use-cases/cards/CreateCardUseCase';
import { GetCardHealthScoreUseCase } from '../../core/application/use-cases/cards/GetCardHealthScoreUseCase';
import { GetCardRecommendationsUseCase } from '../../core/application/use-cases/cards/GetCardRecommendationsUseCase';

// Singleton instances
let cardRepository: InMemoryCardRepository | null = null;
let cardOptimizer: OpenAICardOptimizer | null = null;

export function getCardRepository(): InMemoryCardRepository {
  if (!cardRepository) {
    cardRepository = new InMemoryCardRepository();
  }
  return cardRepository;
}

export function getCardOptimizer(): OpenAICardOptimizer {
  if (!cardOptimizer) {
    cardOptimizer = new OpenAICardOptimizer();
  }
  return cardOptimizer;
}

export function getCreateCardUseCase(): CreateCardUseCase {
  return new CreateCardUseCase(getCardRepository());
}

export function getGetCardHealthScoreUseCase(): GetCardHealthScoreUseCase {
  return new GetCardHealthScoreUseCase(getCardRepository());
}

export function getGetCardRecommendationsUseCase(): GetCardRecommendationsUseCase {
  return new GetCardRecommendationsUseCase(getCardRepository(), getCardOptimizer());
}

export function registerCardsModule() {
  console.log('Cards module registered');
  return {
    cardRepository: getCardRepository(),
    cardOptimizer: getCardOptimizer(),
    createCardUseCase: getCreateCardUseCase(),
    getCardHealthScoreUseCase: getGetCardHealthScoreUseCase(),
    getCardRecommendationsUseCase: getGetCardRecommendationsUseCase(),
  };
}

