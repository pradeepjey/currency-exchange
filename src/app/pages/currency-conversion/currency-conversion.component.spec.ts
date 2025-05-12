import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyConversionComponent } from './currency-conversion.component';
import { ExchangeService } from '../../services/exchange.service';
import { CurrencyArray } from '../../models/currency.model';
import { jasmineExpect } from '../../../test-helpers';

// Mock the CurrenciesDropdownComponent
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-currencies-dropdown',
  template: '<div>Mock Currencies Dropdown</div>'
})
class MockCurrenciesDropdownComponent {
  @Input() label: string = '';
  @Input() isClearRequired: boolean = false;
  @Input() defaultValue: string = '';
  @Input() currencies: CurrencyArray[] = [];
  @Input() selectedCurrency!: FormControl;
  @Output() currencyChanged = new EventEmitter<string>();
}

// Create a mock ExchangeService
class MockExchangeService {
  getCurrencies(): Promise<CurrencyArray[]> {
    return Promise.resolve([
      { key: 'USD', value: 'US Dollar' },
      { key: 'EUR', value: 'Euro' },
      { key: 'GBP', value: 'British Pound' }
    ]);
  }

  calculateRate(from: string, to: string, amount: number): Promise<string> {
    // Mock conversion rate calculation
    const rates = {
      'USD_EUR': 0.85,
      'USD_GBP': 0.75,
      'EUR_USD': 1.18,
      'EUR_GBP': 0.88,
      'GBP_USD': 1.33,
      'GBP_EUR': 1.14
    };
    
    //@ts-ignore
    const rate = rates[`${from}_${to}`] || 1;
    const result = (amount * rate).toFixed(2);
    return Promise.resolve(result);
  }
}

describe('CurrencyConversionComponent', () => {
  let component: CurrencyConversionComponent;
  let fixture: ComponentFixture<CurrencyConversionComponent>;
  let exchangeService: MockExchangeService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, // Required for Material
        ReactiveFormsModule,
        FormsModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        CurrencyConversionComponent, // If standalone
        MockCurrenciesDropdownComponent 
      ],
      declarations: [
      ],
      providers: [
        { provide: ExchangeService, useClass: MockExchangeService },
        MatSnackBar
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyConversionComponent);
    component = fixture.componentInstance;
    exchangeService = TestBed.inject(ExchangeService) as unknown as MockExchangeService;
    snackBar = TestBed.inject(MatSnackBar);
    
    // Spy on service and snackbar methods
    spyOn(exchangeService, 'getCurrencies').and.callThrough();
    spyOn(exchangeService, 'calculateRate').and.callThrough();
    spyOn(snackBar, 'open').and.callThrough();
    
    fixture.detectChanges(); // This triggers ngOnInit
  });

  // Test Case 1: Component Initialization
  it('should initialize the form with three required controls', () => {
    // Assert that the form is created with the correct controls
    jasmineExpect(component.currencyForm).toBeDefined();
    jasmineExpect(component.currencyForm.get('fromCurrency')).toBeDefined();
    jasmineExpect(component.currencyForm.get('toCurrency')).toBeDefined();
    jasmineExpect(component.currencyForm.get('amount')).toBeDefined();
    
    // Check that validators are applied
    const amountControl = component.currencyForm.get('amount');
    amountControl?.setValue('');
    jasmineExpect(amountControl?.valid).toBeFalse();
    jasmineExpect(amountControl?.hasError('required')).toBeTrue();
    
    amountControl?.setValue(0);
    jasmineExpect(amountControl?.valid).toBeFalse();
    jasmineExpect(amountControl?.hasError('min')).toBeTrue();
    
    amountControl?.setValue(10);
    jasmineExpect(amountControl?.valid).toBeTrue();
  });

  // Test Case 2: Currency Data Fetching
  it('should fetch currencies after view initialization', fakeAsync(() => {
    // Trigger ngAfterViewInit (since detectChanges in beforeEach only runs ngOnInit)
    component.ngAfterViewInit();
    
    // Use fakeAsync/tick to handle the Promise in getCurrencies
    tick();
    
    // Verify the service was called
    jasmineExpect(exchangeService.getCurrencies).toHaveBeenCalled();
    
    // Verify currencies were set
    jasmineExpect(component.currencies()).toEqual([
      { key: 'USD', value: 'US Dollar' },
      { key: 'EUR', value: 'Euro' },
      { key: 'GBP', value: 'British Pound' }
    ]);
  }));

  // Test Case 3: Form Submission and Conversion
  it('should calculate exchange rate and show snackbar on form submission', fakeAsync(() => {
    // Set valid form values
    component.currencyForm.setValue({
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100
    });
    
    // Submit the form
    component.onSubmit();
    tick(); // Wait for the async operation
    
    // Verify service was called with correct params
    jasmineExpect(exchangeService.calculateRate).toHaveBeenCalledWith('USD', 'EUR', 100);
    
    // Verify snackbar was shown with correct message
    jasmineExpect(snackBar.open).toHaveBeenCalledWith('Exchanged Rate: 85.00', 'Close');
  }));

  // Test Case 4: Getter Methods for Form Controls
  it('should provide getter methods for currency form controls', () => {
    // Test the fromCurrencyControl getter
    const fromCurrency = component.fromCurrencyControl;
    jasmineExpect(fromCurrency).toBeDefined();
    // @ts-ignore
    jasmineExpect(fromCurrency).toBe(component.currencyForm.get('fromCurrency'));
    
    // Test the toCurrencyControl getter
    const toCurrency = component.toCurrencyControl;
    jasmineExpect(toCurrency).toBeDefined();
    // @ts-ignore
    jasmineExpect(toCurrency).toBe(component.currencyForm.get('toCurrency'));
    
    // Verify they're actual FormControl instances
    jasmineExpect(fromCurrency instanceof FormControl).toBeTrue();
    jasmineExpect(toCurrency instanceof FormControl).toBeTrue();
    
    // Test setting values through the getters
    fromCurrency.setValue('GBP');
    jasmineExpect(component.currencyForm.get('fromCurrency')?.value).toBe('GBP');
    
    toCurrency.setValue('USD');
    jasmineExpect(component.currencyForm.get('toCurrency')?.value).toBe('USD');
  });
});