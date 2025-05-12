import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { ConnectivityService } from './services/connectivity.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PollingService } from './services/polling.service';
import { Subscription } from 'rxjs';
import { StorageService } from './services/storage.service';
import ExchangeRate from './models/exchange-rate.model';

@Component({
  selector: 'app-root',
  imports: [
    // Material components
    MatSidenavModule,

    // Child components
    HeaderComponent,
    NavbarComponent,

    // Router
    RouterOutlet, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements  OnDestroy{
  private _snackBar = inject(MatSnackBar);
  private subscription: Subscription;
  private worker: Worker;

  constructor(
    private connectivityService: ConnectivityService, 
    private pollingService: PollingService,
    private storageService : StorageService
  ) {
    this.worker = new Worker(new URL('./app.worker', import.meta.url));
    this.connectivityService.isOnline$.subscribe(data => {
      if(!data) {
        this._snackBar.open('No Internet Connectivity, displaying cached data', 'Close');
      } else {
        this._snackBar.dismiss();
      }
    });

    this.subscription = this.pollingService.getPolling.subscribe(() => {
      console.log('Hourly update received');
      this.refreshIndexDB();
    });
  }

  /**
   * To toggle polling
   */
  togglePolling(): void {
    if (this.pollingService.isActive) {
      this.pollingService.stopPolling();
    } else {
      this.pollingService.startPolling();
    }
  }

  /**
   * Update indexDB with new data
   */
  async refreshIndexDB() {
    if (typeof Worker !== 'undefined') {

      this.worker.onmessage = ({data}) => {
        data.forEach((item: ExchangeRate) => {
          this.storageService.saveExchange(item);
        });
      };

      this.storageService.getExchangeRateAll().then(data => {
        // Fetch All stored currency information and pass it to web worker
        this.worker.postMessage(data);
      });
    } else {
      // Web Workers are not supported in this environment.
      // Fallback should be added incase if web worker not supported.
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.worker.terminate();
  }
}
