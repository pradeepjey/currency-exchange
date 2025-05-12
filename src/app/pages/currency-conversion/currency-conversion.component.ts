import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrenciesDropdownComponent } from '../../components/currencies-dropdown/currencies-dropdown.component';
import { CurrencyArray } from '../../models/currency.model';
import { MatGridListModule } from '@angular/material/grid-list';
import { ExchangeService } from '../../services/exchange.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-currency-conversion',
  imports: [
    // Material components
    MatGridListModule,
    MatFormFieldModule, 
    MatInputModule,

    // Angular Forms
    ReactiveFormsModule, 
    FormsModule, 

    // Child components
    CurrenciesDropdownComponent, 
  ],
  templateUrl: './currency-conversion.component.html',
  styleUrl: './currency-conversion.component.scss'
})
export class CurrencyConversionComponent {
  currencies = signal<CurrencyArray[]>([]);
  currencyForm!: FormGroup;
  private _snackBar = inject(MatSnackBar);

  constructor(private fb: FormBuilder, private exchangeService: ExchangeService) {}

  ngOnInit(): void {
    this.currencyForm = this.fb.group({
      fromCurrency: ['', Validators.required],
      toCurrency: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngAfterViewInit(): void {
    this.getCurrencies();
  }

  /**
   * Fetches currencies
   */
  getCurrencies() {
    this.exchangeService.getCurrencies().then((currencies:CurrencyArray[]) => {
      if(currencies != null){
        this.currencies.set(currencies);
      }
    });
  }

  /**
   * Form submit to get recent conversion rate and display it using snackbar
   */
  async onSubmit() {
    const exchangeValue =  await this.exchangeService.calculateRate(
      this.currencyForm.value.fromCurrency, 
      this.currencyForm.value.toCurrency, 
      this.currencyForm.value.amount
    );
    
    this._snackBar.open(`Exchanged Rate: ${exchangeValue}`, "Close");
  }

  /**
   * Getter function for fromCurrency form field
   */
  get fromCurrencyControl(): FormControl {
    return this.currencyForm.get('fromCurrency') as FormControl;
  }

  /**
   * Getter function for toCurrency form field
   */
  get toCurrencyControl(): FormControl {
    return this.currencyForm.get('toCurrency') as FormControl;
  }
}
