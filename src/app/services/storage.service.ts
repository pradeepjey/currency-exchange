import { Injectable } from '@angular/core';
import ExchangeRate from '../models/exchange-rate.model';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'ExchangeDB';
  private storeName = 'exchange';
  private dbVersion = 1;
  private db!: IDBDatabase;
  private storageKey = 'currencyCodes';

  constructor() {
    this.initDB();
  }

  /**
   * To initalise DB
   */
  private initDB(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, { keyPath: 'base_currency' });
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('ExchangeDB initialized');
    };

    request.onerror = () => {
      console.error('IndexedDB init error:', request.error);
    };
  }

  /**
   * To get store from DB
   * @param mode - access mode eg. readwrite 
   * @returns Object store
   */
  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    const tx = this.db.transaction(this.storeName, mode);
    return tx.objectStore(this.storeName);
  }

  /**
   * To open database
   * @returns Promise<IDBDatabase> - Resolves when data is loaded
   * @throws Will throw an error if fails
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add or update exchange data
   */
  async saveExchange(data: ExchangeRate): Promise<void> {
    if (!this.db) {
      this.db = await this.openDatabase();
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore('readwrite');
      const request = store.put(data); // put = add or update by keyPath
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get exchange rate from base currency
   * @param base_currency - Currency code
   * @returns Promise<ExchangeRate> - Resolves when data is loaded
   * @throws Will throw an error if fails
   */
  async getExchangeRate(base_currency: string): Promise<ExchangeRate | undefined> {

    if (!this.db) {
      this.db = await this.openDatabase();
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore('readonly');
      const request = store.get(base_currency); // put = add or update by keyPath
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * To get all exchange data stored in db store
   * @returns Promise<any> - Resolves when data is loaded
   */
  async getExchangeRateAll(): Promise<any> {

    if (!this.db) {
      this.db = await this.openDatabase();
    }

    return new Promise((resolve, reject) => {
      const store = this.getStore('readonly');
      const request = store.getAll(); // put = add or update by keyPath
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Store currency codes and names in localStorage.
   * @param data Object with currency codes and names
   */
  setCurrencyData(data: Currency): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Retrieve currency codes and names from localStorage.
   * Returns an object or an empty object if not found.
   */
  getCurrencyData(): Promise<Currency> {
    return new Promise((resolve, reject) => {
      try {
        const raw = localStorage.getItem(this.storageKey);
        resolve(raw ? JSON.parse(raw) : raw);
      } catch (error) {
        reject(error);
      }
    });
  }
}

