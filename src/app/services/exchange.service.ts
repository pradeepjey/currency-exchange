import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import ExchangeRate, { DateWiseRate }  from "../models/exchange-rate.model";
import { getDaysAgo } from "../utils/date-utils";
import { Currency, CurrencyArray } from '../models/currency.model';
import { objectToArray } from '../utils/object-to-array';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {

  constructor(private apiService: ApiService, private storageService: StorageService) { }

  /**
   * To get exchange data
   * @param baseCurrency - Base currency code
   * @returns Promise<ExchangeRate> - Resolves when data is loaded
   * @throws Will throw an error if API request fails
   */
  async getExchangeRate(baseCurrency: string): Promise<ExchangeRate | null>{
    return new Promise(async (resolve, reject) => {
      const list: ExchangeRate | undefined = await this.storageService.getExchangeRate(baseCurrency);
      if(list === undefined){
        const paramsObj = {
          from: baseCurrency,
          api_key: (environment.fastForexKey !== undefined)? environment.fastForexKey: ''
        }

        const params = new URLSearchParams(paramsObj);
        this.apiService.get(`fetch-all?${params}`).subscribe({
          next: (response: any) => {
            const toStore = {base_currency: response.base, results: response.results};
            this.storageService.saveExchange(toStore);
            resolve(toStore);
          },
          error: (err) => {
            console.error('Failed to load data:', err);
            reject(err);
          }
        });
      } else {
        resolve(list);
      }
    })
  }

  /**
   * To get time series rate data
   * @param baseCurrency - Base currency code
   * @param startDateAgo - Days count
   * @returns Promise<DateWiseRate> - Resolves when data is loaded
   * @throws Will throw an error if API request fails
   */
  async getTimeSeriesRate(baseCurrency: string, startDateAgo: number): Promise<DateWiseRate | null>{
    return new Promise(async (resolve, reject) => {
      const paramsObj = {
        from: baseCurrency,
        to: 'USD',
        start: getDaysAgo(startDateAgo),
        end: getDaysAgo(1),
        api_key: (environment.fastForexKey !== undefined)? environment.fastForexKey: ''
      } 
      const params = new URLSearchParams(paramsObj);

      this.apiService.get(`time-series?${params}`).subscribe({
        next: (response: any) => {
          const toStore = response.results['USD'];
          resolve(toStore);
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          reject(err);
        }
      })
    })
  }

  /**
   * Calculate exchange rate between two currency
   * @param baseCurrency - From currency code
   * @param currencyCode - To currency code
   * @param amount - Amount in number
   * @returns Promise<string> - Resolves when data is loaded
   * @throws Will throw an error if API request fails
   */
  async calculateRate(baseCurrency: string, currencyCode: string, amount: number): Promise<string | null>{
    return new Promise(async (resolve, reject) => {
      const paramsObj = {
        from: baseCurrency,
        to: currencyCode,
        amount: amount.toString(),
        api_key: (environment.fastForexKey !== undefined)? environment.fastForexKey: ''
      } 

      const params = new URLSearchParams(paramsObj);
      this.apiService.get(`convert?${params}`).subscribe({
        next: (response: any) => {
          resolve(response.result[currencyCode]);
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          reject(err);
        }
      })
    })
  }

  /**
   * To get currencies list
   * @returns Promise<CurrencyArray> - Resolves when data is loaded
   * @throws Will throw an error if API request fails
   */
  async getCurrencies(): Promise<CurrencyArray[]>{
    return new Promise(async (resolve, reject) => {
      const list: Currency | undefined = await this.storageService.getCurrencyData();
      if(list === null){
        const paramsObj = {
          api_key: (environment.fastForexKey !== undefined)? environment.fastForexKey: ''
        } 
        const params = new URLSearchParams(paramsObj);
        this.apiService.get(`currencies?${params}`).subscribe({
          next: (response: any) => {
            this.storageService.setCurrencyData(response.currencies);
            const arrayResp = objectToArray(response.currencies);
            resolve(arrayResp);
          },
          error: (err) => {
            console.error('Failed to load data:', err);
            reject(err);
          }
        });
      } else {
        const arrayResp = objectToArray(list);
        resolve(arrayResp);
      }
    })
  }
}
