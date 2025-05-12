// exchange.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ExchangeService } from './exchange.service';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { of } from 'rxjs';
import ExchangeRate from '../models/exchange-rate.model';
import * as DateUtils from '../utils/date-utils';
import { jasmineExpect } from '../../test-helpers';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let originalGetDaysAgo: any;

  beforeEach(() => {
    // Create spy objects for the dependent services
    const apiSpy = jasmine.createSpyObj('ApiService', ['get']);
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getExchangeRate', 
      'saveExchange', 
      'getCurrencyData', 
      'setCurrencyData'
    ]);

    originalGetDaysAgo = DateUtils.getDaysAgo;

    TestBed.configureTestingModule({
      providers: [
        ExchangeService,
        { provide: ApiService, useValue: apiSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(ExchangeService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    jasmineExpect(service).toBeTruthy();
  });

  // getExchangeRate should return cached data if available
  it('should return cached exchange rate data when available in storage', async () => {
    // Mock data
    const mockExchangeRate: ExchangeRate = {
      base_currency: 'EUR',
      results: { USD: 1.18, GBP: 0.85 }
    };
    
    // Set up the storage service to return cached data
    storageServiceSpy.getExchangeRate.and.returnValue(Promise.resolve(mockExchangeRate));
    
    // Call the method and check the result
    const result = await service.getExchangeRate('EUR');
    
    // Verify storage was checked
    jasmineExpect(storageServiceSpy.getExchangeRate).toHaveBeenCalledWith('EUR');
    
    // Verify API was not called since data was in storage
    jasmineExpect(apiServiceSpy.get).not.toHaveBeenCalled();
    
    // Verify the correct data was returned
    jasmineExpect(result).toEqual(mockExchangeRate);
  });

  // getExchangeRate should fetch from API when not in cache
  it('should fetch exchange rate data from API when not available in storage', async () => {
    // Set up the storage service to return undefined (no cached data)
    storageServiceSpy.getExchangeRate.and.returnValue(Promise.resolve(undefined));
    
    // Mock API response
    const mockApiResponse = {
      base: 'EUR',
      results: { USD: 1.18, GBP: 0.85 }
    };
    
    apiServiceSpy.get.and.returnValue(of(mockApiResponse));
    
    // Call the method
    const result = await service.getExchangeRate('EUR');
    
    // Expected transformed data to be stored and returned
    const expectedExchangeRate: ExchangeRate = {
      base_currency: 'EUR',
      results: { USD: 1.18, GBP: 0.85 }
    };
    
    // Verify storage was checked first
    jasmineExpect(storageServiceSpy.getExchangeRate).toHaveBeenCalledWith('EUR');
    
    // Verify API was called with correct params
    jasmineExpect(apiServiceSpy.get).toHaveBeenCalledWith(jasmine.stringMatching(/fetch-all\?.*from=EUR.*api_key=/));
    
    // Verify data was saved to storage
    jasmineExpect(storageServiceSpy.saveExchange).toHaveBeenCalledWith(expectedExchangeRate);
    
    // Verify the correct data was returned
    jasmineExpect(result).toEqual(expectedExchangeRate);
  });

  it('should fetch and return time series rate data', async () => {
    // Mock API response for time series
    const mockTimeSeriesResponse = {
      results: {
        'USD': {
          '2023-05-01': 1.18,
          '2023-05-02': 1.19,
          '2023-05-03': 1.20
        }
      }
    };
    
    apiServiceSpy.get.and.returnValue(of(mockTimeSeriesResponse));
    
    // Call the method
    const result = await service.getTimeSeriesRate('EUR', 10);
    
    // Expected data to be returned
    const expectedTimeSeries = {
      '2023-05-01': 1.18,
      '2023-05-02': 1.19,
      '2023-05-03': 1.20
    };
    
    // Verify API was called with a URL that includes the expected parameters
    jasmineExpect(apiServiceSpy.get).toHaveBeenCalledWith(
      jasmine.stringMatching(/time-series\?from=EUR&to=USD&start=.*&end=.*&api_key=/)
    );
    
    // Verify the correct data was returned
    // @ts-ignore
    jasmineExpect(result).toEqual(expectedTimeSeries);
  });
});