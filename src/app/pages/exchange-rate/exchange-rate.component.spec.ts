import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ExchangeRateComponent } from './exchange-rate.component';
import { ExchangeService } from '../../services/exchange.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyArray } from '../../models/currency.model';
import ExchangeRate from '../../models/exchange-rate.model';
import ExchangeTable from '../../models/exchange-table.model';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { jasmineExpect } from '../../../test-helpers';



// Mock TextSearchComponent
@Component({
  selector: 'app-text-search',
  template: '<div>Text Search Mock</div>'
})
class MockTextSearchComponent {
  @Input() label: string;
  @Output() inputChanged = new EventEmitter<string | null>();
  
  triggerSearch(value: string | null) {
    this.inputChanged.emit(value);
  }
}

// Mock CurrenciesDropdownComponent
@Component({
  selector: 'app-currencies-dropdown',
  template: '<div>Currencies Dropdown Mock</div>'
})
class MockCurrenciesDropdownComponent {
  @Input() label: string;
  @Input() isClearRequired: boolean;
  @Input() defaultValue: string;
  @Input() currencies: CurrencyArray[];
  @Input() selectedCurrency: FormControl;
  @Output() currencyChanged = new EventEmitter<string>();
  
  triggerChange(value: string) {
    this.currencyChanged.emit(value);
  }
}

// Mock Exchange Service
class MockExchangeService {
  getCurrencies(): Promise<CurrencyArray[]> {
    return Promise.resolve([
      { key: 'MYR', value: 'Malaysian Ringgit' },
      { key: 'USD', value: 'US Dollar' },
      { key: 'EUR', value: 'Euro' }
    ]);
  }
  
  getExchangeRate(baseCurrency: string): Promise<ExchangeRate | null> {
    const mockData: ExchangeRate = {
      base_currency: baseCurrency,
      results: {
        USD: baseCurrency === 'MYR' ? 0.23 : 1.0,
        EUR: baseCurrency === 'MYR' ? 0.19 : 0.85,
        MYR: baseCurrency === 'USD' ? 4.35 : 5.26,
        GBP: baseCurrency === 'MYR' ? 0.17 : 0.76
      }
    };
    
    // Remove the base currency from results (as it would have rate 1.0)
    delete mockData.results[baseCurrency];
    
    return Promise.resolve(mockData);
  }
}

describe('ExchangeRateComponent', () => {
  let component: ExchangeRateComponent;
  let fixture: ComponentFixture<ExchangeRateComponent>;
  let exchangeService: MockExchangeService;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        ReactiveFormsModule,
        ExchangeRateComponent, // If standalone
        MockTextSearchComponent,
        MockCurrenciesDropdownComponent
      ],
      declarations: [],
      providers: [
        { provide: ExchangeService, useClass: MockExchangeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchangeRateComponent);
    component = fixture.componentInstance;
    exchangeService = TestBed.inject(ExchangeService) as unknown as MockExchangeService;
    loader = TestbedHarnessEnvironment.loader(fixture);
    
    // Spy on service methods
    spyOn(exchangeService, 'getCurrencies').and.callThrough();
    spyOn(exchangeService, 'getExchangeRate').and.callThrough();

    // Don't call detectChanges yet, as we need to manually handle some initialization
    // fixture.detectChanges();
  });

  it('should create', () => {
    jasmineExpect(component).toBeTruthy();
  });

  it('should initialize the component with currencies and exchange rates for default base currency', fakeAsync(() => {
    // Manually trigger initialization
    fixture.detectChanges(); // This triggers ngAfterViewInit
    
    // Wait for all promises to resolve
    tick();
    
    // Verify currencies were fetched
    jasmineExpect(exchangeService.getCurrencies).toHaveBeenCalled();
    
    // Verify exchange rates were fetched with default base currency (MYR)
    jasmineExpect(exchangeService.getExchangeRate).toHaveBeenCalledWith('MYR');
    
    // Verify data is set correctly
    jasmineExpect(component.baseCurrency).toBe('MYR');
    jasmineExpect(component.currencies().length).toBe(3);
    jasmineExpect(component.baseCurrencyControl.value).toBe('MYR');
    
    // Verify table is initialized
    jasmineExpect(component.dataSource.data.length).toBeGreaterThan(0);
    jasmineExpect(component.dataSource.sort).toBe(component.sort);
    
    // Verify filter predicate is set
    const testData: ExchangeTable = { 
      currencyCode: 'USD', 
      rate: 0.23, 
      baseCurrency: 'MYR' 
    };
    
    jasmineExpect(component.dataSource.filterPredicate(testData, 'usd')).toBeTrue();
    jasmineExpect(component.dataSource.filterPredicate(testData, 'eur')).toBeFalse();
  }));


  it('should update the exchange rate table when base currency changes', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    // Verify initial state
    jasmineExpect(component.baseCurrency).toBe('MYR');
    const initialData = [...component.dataSource.data];
    
    // Reset spies to track new calls
    (exchangeService.getExchangeRate as jasmine.Spy).calls.reset();
    
    // Change base currency
    component.updateTable('USD');
    tick();
    
    // Verify service was called with new base currency
    jasmineExpect(exchangeService.getExchangeRate).toHaveBeenCalledWith('USD');
    
    // Verify base currency was updated
    jasmineExpect(component.baseCurrency).toBe('USD');
    
    // Verify table data changed
    jasmineExpect(component.dataSource.data).not.toEqual(initialData);
    
    // Check that MYR is now in the table (since base currency is USD)
    const myrEntry = component.dataSource.data.find(d => d.currencyCode === 'MYR');
    jasmineExpect(myrEntry).toBeDefined();
    jasmineExpect(myrEntry?.rate).toBe(4.35);
    
    // Check that USD is not in the table (since it's the base currency)
    const usdEntry = component.dataSource.data.find(d => d.currencyCode === 'USD');
    jasmineExpect(usdEntry).toBeUndefined();
  }));
  

  it('should filter the exchange rate table based on currency code', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    // Get the initial number of rows
    const initialRowCount = component.dataSource.data.length;
    jasmineExpect(initialRowCount).toBeGreaterThan(0);
    
    // Apply filter for USD
    component.filterTable('USD');
    
    // Check that filter is applied
    jasmineExpect(component.dataSource.filter).toBe('USD');
    
    // Filtered data should only include USD
    const filteredData = component.dataSource.filteredData;
    jasmineExpect(filteredData.length).toBe(1);
    jasmineExpect(filteredData[0].currencyCode).toBe('USD');
    
    // Clear filter
    component.filterTable('clear');
    
    // Filter should be reset
    jasmineExpect(component.dataSource.filter).toBe('');
    jasmineExpect(component.filterCurrencyControl.value).toBeNull();
    
    // All rows should be visible again
    jasmineExpect(component.dataSource.filteredData.length).toBe(initialRowCount);
  }));
  

  it('should update table filter when search text changes', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    // Initial state - no filter
    jasmineExpect(component.dataSource.filter).toBe('');
    
    // Apply text search
    component.updateSearchFilter('EU');
    
    // Check that filter is applied
    jasmineExpect(component.dataSource.filter).toBe('EU');
    
    // Filtered data should only include EUR (since it contains 'EU')
    const filteredData = component.dataSource.filteredData;
    jasmineExpect(filteredData.length).toBe(1);
    jasmineExpect(filteredData[0].currencyCode).toBe('EUR');
    
    // Clear search (null input)
    component.updateSearchFilter(null);
    
    // Filter should be reset
    jasmineExpect(component.dataSource.filter).toBe('');
    
    // Empty string also clears the filter
    component.updateSearchFilter('');
    jasmineExpect(component.dataSource.filter).toBe('');
  }));
});
