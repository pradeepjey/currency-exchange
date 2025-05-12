import { Component, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CurrencyArray } from '../../models/currency.model';

@Component({
  selector: 'app-currencies-dropdown',
  imports: [
    // Material Components
    MatSelectModule,
    MatFormFieldModule,
    
    // Angular forms
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './currencies-dropdown.component.html',
  styleUrl: './currencies-dropdown.component.scss'
})
export class CurrenciesDropdownComponent {
  label = input<string>('');
  isClearRequired = input<boolean>(false);
  defaultValue = input<string>();
  currencies = input<CurrencyArray[]>();
  currencyChanged = output<string>();
  selectedCurrency = input.required<FormControl>();

  constructor() {}

  /**
   * Select box Change Event
   * @param event - select event
   */
  onSelectionChange(event: MatSelectChange) {
    this.currencyChanged.emit(event.value);
  }
}
