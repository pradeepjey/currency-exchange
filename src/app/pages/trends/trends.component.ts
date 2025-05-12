import { AfterViewInit, Component, signal } from '@angular/core';
import { LineChartComponent } from '../../components/line-chart/line-chart.component';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { CurrenciesDropdownComponent } from '../../components/currencies-dropdown/currencies-dropdown.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CurrencyArray } from '../../models/currency.model';
import { ExchangeService } from '../../services/exchange.service';
import { DateWiseRate } from '../../models/exchange-rate.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-trends',
  imports: [
    // Material components
    MatButtonToggleModule,
    MatGridListModule,

    // Child components
    LineChartComponent,
    CurrenciesDropdownComponent
  ],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.scss'
})
export class TrendsComponent implements AfterViewInit {
  currencies = signal<CurrencyArray[]>([]);
  index = signal<number>(0);
  label = signal<string>('');
  data = signal<DateWiseRate | null>(null);
  daysCount : string = "14";
  currencyControls = [
    new FormControl(''),
    new FormControl(''),
    new FormControl('')
  ];

  constructor(private exchangeService: ExchangeService) {}

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
   * Fetches historical trends data based
   * @param event - currency code
   * @param days - No. of days to fetch data for
   * @returns Promise<DateWiseRate> - Resolves when data is loaded
   */
  async fetchTrends(event: string, days: number): Promise<DateWiseRate | null> {
    return new Promise(async (resolve) => {
      const trends = await this.exchangeService.getTimeSeriesRate(event, days);
      resolve(trends);
    })

  }

  /**
   * Toggle chart view based on no. of days selected
   * @param event - Toggle event with days as value
   */
  toggleView(event: MatButtonToggleChange) {
    this.daysCount = event.value;
  }

  /**
   * Fetches trends and updates the child component(chart) data
   * @param event - Currency code
   * @param index - dataset index 0 | 1 | 2
   */
  async updateChart(event: string, index: number) {
    this.daysCount = "14";
    const trendsObj = await this.fetchTrends(event, Number(this.daysCount));
    this.index.set(index);
    this.label.set(event);
    this.data.set(trendsObj);
  }
}
