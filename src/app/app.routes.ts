import { Routes } from '@angular/router';
import { ExchangeRateComponent } from './pages/exchange-rate/exchange-rate.component';
import { CurrencyConversionComponent } from './pages/currency-conversion/currency-conversion.component';
import { TrendsComponent } from './pages/trends/trends.component';
import { NotFoundComponent } from './pages/not-found.component';

export const routes: Routes = [
  { path: '', component: ExchangeRateComponent, pathMatch: 'full' },
  { path: 'exchange', redirectTo: '', pathMatch: 'full' },
  { path: 'trends', component: TrendsComponent },
  { path: 'calculator', component: CurrencyConversionComponent },
  { path: '**', component: NotFoundComponent }
];
