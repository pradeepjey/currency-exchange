// storage.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import ExchangeRate from '../models/exchange-rate.model';
import { Currency } from '../models/currency.model';
import { jasmineExpect } from '../../test-helpers';

describe('StorageService', () => {
  let service: StorageService;
  
  // Mock indexedDB objects
  let mockIDBDatabase: any;
  let mockIDBObjectStore: any;
  let mockIDBTransaction: any;
  
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {};
    spyOn(Storage.prototype, 'getItem').and.callFake((key) => {
      return localStorageMock[key] || null;
    });
    spyOn(Storage.prototype, 'setItem').and.callFake((key, value) => {
      localStorageMock[key] = value.toString();
    });
    
    // Create mock object store
    mockIDBObjectStore = {
      put: jasmine.createSpy('put').and.callFake(() => {
        const request = { onsuccess: null, onerror: null };
        //@ts-ignore
        setTimeout(() => request.onsuccess && request.onsuccess({ target: { result: undefined } }), 0);
        return request;
      }),
      get: jasmine.createSpy('get').and.callFake((key) => {
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
          if (key === 'USD') {
            //@ts-ignore
            request.onsuccess && request.onsuccess({ 
              target: { result: { base_currency: 'USD', results: { EUR: 0.85, GBP: 0.75 } } }
            });
          } else {
            //@ts-ignore
            request.onsuccess && request.onsuccess({ target: { result: undefined } });
          }
        }, 0);
        return request;
      }),
      getAll: jasmine.createSpy('getAll').and.callFake(() => {
        const request = { onsuccess: null, onerror: null };
        setTimeout(() => {
          //@ts-ignore
          request.onsuccess && request.onsuccess({
            target: {
              result: [
                { base_currency: 'USD', results: { EUR: 0.85, GBP: 0.75 } },
                { base_currency: 'EUR', results: { USD: 1.18, GBP: 0.88 } }
              ]
            }
          });
        }, 0);
        return request;
      })
    };
    
    // Create mock transaction
    mockIDBTransaction = {
      objectStore: jasmine.createSpy('objectStore').and.returnValue(mockIDBObjectStore)
    };
    
    // Create mock database
    mockIDBDatabase = {
      transaction: jasmine.createSpy('transaction').and.returnValue(mockIDBTransaction)
    };

    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    
    service = TestBed.inject(StorageService);
    
    // Directly set the mock database on the service
    (service as any).db = mockIDBDatabase;
    
    // Skip the initDB logic since we're injecting our mock directly
    spyOn(service as any, 'initDB').and.callFake(() => {});
    spyOn(service as any, 'openDatabase').and.returnValue(Promise.resolve(mockIDBDatabase));
  });

  it('should be created', () => {
    jasmineExpect(service).toBeTruthy();
  });

  // saveExchange should store data in IndexedDB
  it('should save exchange rate data to IndexedDB', async () => {
    // Mock data to save
    const exchangeData: ExchangeRate = {
      base_currency: 'USD',
      results: { EUR: 0.85, GBP: 0.75 }
    };
    
    // Call the method
    await service.saveExchange(exchangeData);
    
    // Verify the correct transaction was created
    jasmineExpect(mockIDBDatabase.transaction).toHaveBeenCalledWith('exchange', 'readwrite');
    
    // Verify the object store was accessed
    jasmineExpect(mockIDBTransaction.objectStore).toHaveBeenCalledWith('exchange');
    
    // Verify put was called with the correct data
    jasmineExpect(mockIDBObjectStore.put).toHaveBeenCalledWith(exchangeData);
  });


  // setCurrencyData and getCurrencyData should store and retrieve from localStorage
  it('should store and retrieve currency data from localStorage', async () => {
    // Mock currency data
    const currencyData: Currency = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound'
    };
    
    // Store the data
    await service.setCurrencyData(currencyData);
    
    // Verify localStorage.setItem was called with the correct parameters
    jasmineExpect(Storage.prototype.setItem).toHaveBeenCalledWith(
      'currencyCodes', 
      JSON.stringify(currencyData)
    );
    
    // Retrieve the data
    const result = await service.getCurrencyData();
    
    // Verify localStorage.getItem was called with the correct key
    jasmineExpect(Storage.prototype.getItem).toHaveBeenCalledWith('currencyCodes');
    
    // Verify the correct data was returned - need to parse it first as our mock doesn't do the JSON.parse
    const parsedData = JSON.parse(localStorageMock['currencyCodes']);
    jasmineExpect(result).toEqual(parsedData);
  });
});