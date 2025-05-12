import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TrendsComponent } from './trends.component';
import { ExchangeService } from '../../services/exchange.service';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { CurrencyArray } from '../../models/currency.model';
import { DateWiseRate } from '../../models/exchange-rate.model';
import { jasmineExpect } from '../../../test-helpers';

// Mock LineChartComponent
@Component({
  selector: 'app-line-chart',
  template: '<div>Chart Component Mock</div>'
})
class MockLineChartComponent {
  @Input() index: number = 0;
  @Input() label: string = '';
  @Input() data: DateWiseRate | null = null;
  @Input() chartViewUpdate: string = '14';
}

// Mock CurrenciesDropdownComponent
@Component({
  selector: 'app-currencies-dropdown',
  template: '<div>Currencies Dropdown Mock</div>'
})
class MockCurrenciesDropdownComponent {
  @Input() label: string = '';
  @Input() isClearRequired: boolean = false;
  @Input() defaultValue: string = '';
  @Input() currencies: CurrencyArray[] = [];
  @Input() selectedCurrency: FormControl = new FormControl();
}

// Mock ExchangeService
class MockExchangeService {
  getCurrencies(): Promise<CurrencyArray[]> {
    return Promise.resolve([
      { key: 'USD', value: 'US Dollar' },
      { key: 'EUR', value: 'Euro' },
      { key: 'GBP', value: 'British Pound' }
    ]);
  }
  
  getTimeSeriesRate(currency: string, days: number): Promise<DateWiseRate | null> {
    // Mock time series data for testing
    const mockData: DateWiseRate = {
      //@ts-ignore
      '2023-01-01': 1.05,
      '2023-01-02': 1.06,
      '2023-01-03': 1.04,
      '2023-01-04': 1.07,
      '2023-01-05': 1.08,
      '2023-01-06': 1.06,
      '2023-01-07': 1.05,
      '2023-01-08': 1.04,
      '2023-01-09': 1.03,
      '2023-01-10': 1.02,
      '2023-01-11': 1.03,
      '2023-01-12': 1.04,
      '2023-01-13': 1.05,
      '2023-01-14': 1.06
    };
    
    // Add currency code to the mock data to help with testing
    return Promise.resolve(mockData);
  }
}

describe('TrendsComponent', () => {
  let component: TrendsComponent;
  let fixture: ComponentFixture<TrendsComponent>;
  let exchangeService: MockExchangeService;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatButtonToggleModule,
        MatGridListModule,
        ReactiveFormsModule,
        TrendsComponent, // If standalone
        MockLineChartComponent,
        MockCurrenciesDropdownComponent
      ],
      declarations: [],
      providers: [
        { provide: ExchangeService, useClass: MockExchangeService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TrendsComponent);
    component = fixture.componentInstance;
    exchangeService = TestBed.inject(ExchangeService) as unknown as MockExchangeService;
    
    // Spy on service methods
    spyOn(exchangeService, 'getCurrencies').and.callThrough();
    spyOn(exchangeService, 'getTimeSeriesRate').and.callThrough();
  });
  
  // Component Initialization
  it('should initialize with default values and fetch currencies', fakeAsync(() => {
    // Trigger initialization
    fixture.detectChanges(); // Calls ngAfterViewInit
    tick(); // Wait for promises to resolve
    
    // Verify service was called
    jasmineExpect(exchangeService.getCurrencies).toHaveBeenCalled();
    
    // Check component initial state
    jasmineExpect(component.currencies().length).toBe(3); // 3 currencies from mock
    jasmineExpect(component.index()).toBe(0);
    jasmineExpect(component.label()).toBe('');
    jasmineExpect(component.data()).toBeNull();
    jasmineExpect(component.daysCount).toBe('14'); // Default days
    
    // Check currency controls
    jasmineExpect(component.currencyControls.length).toBe(3);
    component.currencyControls.forEach(control => {
      jasmineExpect(control instanceof FormControl).toBeTrue();
      jasmineExpect(control.value).toBe('');
    });
  }));
  
  // Fetch Trends Data
  it('should fetch time series data for a currency', fakeAsync(() => {
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Call fetchTrends with a currency and days
    const trendsPromise = component.fetchTrends('EUR', 14);
    tick(); // Wait for promise to resolve
    
    // Verify service was called with correct parameters
    jasmineExpect(exchangeService.getTimeSeriesRate).toHaveBeenCalledWith('EUR', 14);
    
    // Verify the promise resolves with data
    trendsPromise.then(result => {
      jasmineExpect(result).not.toBeNull();
      if (result) {
        jasmineExpect(Object.keys(result).length).toBeGreaterThan(0);
        // Check one of the dates
        //@ts-ignore
        jasmineExpect(result['2023-01-01']).toBe(1.05);
      }
    });
  }));
  
  // Toggle Chart View
  it('should update days count when view is toggled', () => {
    // Initialize component
    fixture.detectChanges();
    
    // Initial state
    jasmineExpect(component.daysCount).toBe('14');
    
    // Create a MatButtonToggleChange event
    const toggleEvent = {
      value: '30'
    } as MatButtonToggleChange;
    
    // Call toggleView
    component.toggleView(toggleEvent);
    
    // Verify daysCount was updated
    jasmineExpect(component.daysCount).toBe('30');
    
    // Try another value
    const toggleEvent2 = {
      value: '7'
    } as MatButtonToggleChange;
    
    component.toggleView(toggleEvent2);
    jasmineExpect(component.daysCount).toBe('7');
  });
  
  // Update Chart
  it('should update chart data when updateChart is called', fakeAsync(() => {
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Initial state
    jasmineExpect(component.data()).toBeNull();
    jasmineExpect(component.index()).toBe(0);
    jasmineExpect(component.label()).toBe('');
    
    // Call updateChart with a currency and index
    component.updateChart('EUR', 1);
    tick(); // Wait for promises to resolve
    
    // Verify service calls
    jasmineExpect(exchangeService.getTimeSeriesRate).toHaveBeenCalledWith('EUR', 14);
    
    // Verify signals were updated
    jasmineExpect(component.index()).toBe(1);
    jasmineExpect(component.label()).toBe('EUR');
    jasmineExpect(component.data()).not.toBeNull();
    
    // Verify daysCount was reset
    jasmineExpect(component.daysCount).toBe('14');
    
    // Check data content
    const chartData = component.data();
    if (chartData) {
      jasmineExpect(Object.keys(chartData).length).toBeGreaterThan(0);
    }
  }));
  
  // Multiple Chart Updates
  it('should handle multiple chart updates with different currencies', fakeAsync(() => {
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Update first chart
    component.updateChart('EUR', 1);
    tick();
    
    // Verify first update
    jasmineExpect(component.index()).toBe(1);
    jasmineExpect(component.label()).toBe('EUR');
    
    // Reset spy counts
    (exchangeService.getTimeSeriesRate as jasmine.Spy).calls.reset();
    
    // Update second chart
    component.updateChart('USD', 2);
    tick();
    
    // Verify second update
    jasmineExpect(component.index()).toBe(2);
    jasmineExpect(component.label()).toBe('USD');
    jasmineExpect(exchangeService.getTimeSeriesRate).toHaveBeenCalledWith('USD', 14);
    
    // Reset spy counts
    (exchangeService.getTimeSeriesRate as jasmine.Spy).calls.reset();
    
    // Update third chart
    component.updateChart('GBP', 3);
    tick();
    
    // Verify third update
    jasmineExpect(component.index()).toBe(3);
    jasmineExpect(component.label()).toBe('GBP');
    jasmineExpect(exchangeService.getTimeSeriesRate).toHaveBeenCalledWith('GBP', 14);
  }));
  
  //Integration with Child Components
  it('should pass correct data to LineChartComponent', fakeAsync(() => {
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Update chart data
    component.updateChart('MYR', 1);
    tick();
    
    // Force change detection to update child components
    fixture.detectChanges();
    
    // Find LineChartComponent instances
    const chartComponents = fixture.debugElement.queryAll(
      // By.directive(MockLineChartComponent)
      elem => elem.name === 'app-line-chart'
    );
    
    // Should find at least one chart component
    jasmineExpect(chartComponents.length).toBeGreaterThan(0);
    
    // Get the first chart component
    const chartComponent = chartComponents[0].componentInstance as MockLineChartComponent;
    
    // Verify inputs are correctly passed
    // @ts-ignore
    jasmineExpect(chartComponent.index()).toBe(1);
    // @ts-ignore
    jasmineExpect(chartComponent.label()).toBe('MYR');
    // @ts-ignore
    jasmineExpect(chartComponent.data()).toEqual(component.data());
  }));
  
  // Error Handling
  it('should handle null values from the service', fakeAsync(() => {
    // Initialize component
    fixture.detectChanges();
    tick();
    
    // Mock service to return null
    (exchangeService.getTimeSeriesRate as jasmine.Spy).and.returnValue(Promise.resolve(null));
    
    // Call updateChart
    component.updateChart('EUR', 1);
    tick();
    
    // Verify component handles null gracefully
    jasmineExpect(component.index()).toBe(1);
    jasmineExpect(component.label()).toBe('EUR');
    jasmineExpect(component.data()).toBeNull();
  }));
});