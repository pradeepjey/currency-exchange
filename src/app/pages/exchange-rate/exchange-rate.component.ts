import { AfterViewInit, Component, signal, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ExchangeService } from '../../services/exchange.service';
import { CurrencyArray } from '../../models/currency.model';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import ExchangeRate from '../../models/exchange-rate.model';
import ExchangeTable from '../../models/exchange-table.model';
import { TextSearchComponent } from '../../components/text-search/text-search.component';
import { CurrenciesDropdownComponent } from '../../components/currencies-dropdown/currencies-dropdown.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-exchange-rate',
  imports: [
    // Material components
    MatGridListModule,  
    MatIconModule, 
    MatInputModule,
    MatTableModule, 
    MatSortModule, 

    // Child components
    TextSearchComponent, 
    CurrenciesDropdownComponent
  ],
  templateUrl: './exchange-rate.component.html',
  styleUrl: './exchange-rate.component.scss'
})
export class ExchangeRateComponent implements AfterViewInit {
  currencies = signal<CurrencyArray[]>([]);
  displayedColumns: string[] = ['base', 'currency', 'rate'];
  dataSource = new MatTableDataSource<ExchangeTable>([]);
  baseCurrency: string = "MYR";
  baseCurrencyControl = new FormControl<string | undefined>(undefined);
  filterCurrencyControl = new FormControl<string | undefined>(undefined);

  @ViewChild(MatSort) sort: MatSort;

  constructor(private exchangeService: ExchangeService) {}

  ngAfterViewInit() {
    this.getCurrencies();
    this.updateTable(this.baseCurrency);
    this.baseCurrencyControl.setValue(this.baseCurrency);
    this.dataSource.filterPredicate = (data: ExchangeTable, filter: string) =>
      data.currencyCode.toLowerCase().includes(filter.trim().toLowerCase());
  }

  /**
   * Fetches currencies
   */
  getCurrencies() {
    this.exchangeService.getCurrencies().then((currencies:CurrencyArray[]) => {
      if(currencies != null) {
        this.currencies.set(currencies);
      }
    });
  }

  /**
   * Fetches Exchange rates against base currency
   * @param baseCurrency - Base currency code
   * @returns Promise<ExchangeTable> - Resolves when data is loaded
   */
  getRates(baseCurrency: string): Promise<ExchangeTable[]> {
    return new Promise(async (resolve) => {
      this.exchangeService.getExchangeRate(baseCurrency).then((data: ExchangeRate | null) => {
        if(data != null) {
          const objectToArray = Object.keys(data.results).map(currencyCode => ({
            currencyCode,
            rate: data.results[currencyCode],
            baseCurrency: data.base_currency
          }));
          resolve(objectToArray);
        }
      });
    });
  }

  /**
   * Fetches exchange data through getRates() and update the table
   * @param event - Base currency code
   */
  async updateTable(event: string) {
    this.baseCurrency = event;
    const tableData = await this.getRates(this.baseCurrency);
    this.dataSource = new MatTableDataSource<ExchangeTable>(tableData);
    this.dataSource.sort = this.sort;
  }

  /**
   * Filter table by currency code
   * @param event - Currency code
   */
  filterTable(event: string) {
    if(event === 'clear'){
      this.filterCurrencyControl.reset();
      this.dataSource.filter = '';
    } else {
      this.dataSource.filter = event;
    }
  }

  /**
   * Text search table on input change
   * @param event - Search string
   */
  updateSearchFilter(event: string | null) {
    this.dataSource.filter = (event === '' || event === null)? '' : event;
  }
}
