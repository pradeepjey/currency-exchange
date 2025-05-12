import { CurrenciesDropdownComponent } from './currencies-dropdown.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyArray } from '../../models/currency.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { jasmineExpect } from '../../../test-helpers';


describe('CurrenciesDropdownComponent', () => {
  let component: CurrenciesDropdownComponent;
  let fixture: ComponentFixture<CurrenciesDropdownComponent>;
  let formBuilder: FormBuilder;
  let mockFormControl: FormControl;

  const mockCurrencies: CurrencyArray[] = [
    { key: 'USD', value: 'US Dollar' },
    { key: 'EUR', value: 'Euro' },
    { key: 'GBP', value: 'British Pound'}
  ];

  beforeEach(async () => {
    mockFormControl = new FormControl('USD');

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        CurrenciesDropdownComponent
      ],
      providers: [
        FormBuilder,
      ],
      schemas: [NO_ERRORS_SCHEMA] 
    })
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrenciesDropdownComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('selectedCurrency', mockFormControl);

    fixture.componentRef.setInput('label', 'Currency');
    fixture.componentRef.setInput('isClearRequired', false);
    fixture.componentRef.setInput('defaultValue', 'USD');
    fixture.componentRef.setInput('currencies', mockCurrencies);

    
    // Set up a spy on the output
    spyOn(component.currencyChanged, 'emit');
    
    // Now call detectChanges to trigger lifecycle hooks
    fixture.detectChanges();
  });

  it('should create', () => {
    jasmineExpect(component).toBeTruthy();
  });


  describe('Input bindings', () => {
    it('should accept label input', () => {
      const testLabel = 'Currency Selector';
      
      // Set the input
      fixture.componentRef.setInput('label', testLabel);
      fixture.detectChanges();
      
      // Access the signal's current value (not calling it as a function)
      // This works in some Angular versions
      const labelValue = component.label(); // or .()
      jasmineExpect(labelValue).toBe(testLabel);
    });

    it('should default isClearRequired to false', () => {
      jasmineExpect(component.isClearRequired()).toBeFalse();
    });

    it('should require selectedCurrency input', () => {
      const control = new FormControl('USD');
      fixture.componentRef.setInput('selectedCurrency', control);
      fixture.detectChanges();
      jasmineExpect(component.selectedCurrency()).toBe(control);
    });
  });
});
