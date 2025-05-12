// app.worker.spec.ts
import { jasmineExpect } from '../test-helpers';
import ExchangeRate from './models/exchange-rate.model';

// Mock StorageService class
class MockStorageService {
  getExchangeRateAll(): Promise<ExchangeRate[]> {
    return Promise.resolve([
      { base_currency: 'USD' } as ExchangeRate,
      { base_currency: 'EUR' } as ExchangeRate
    ]);
  }

  saveExchange(data: any): void {
    // simulate saving
    jasmineExpect(data.base_currency).toBeDefined();
    jasmineExpect(data.results).toBeDefined();
  }
}
