import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { takeUntil, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PollingService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private notifier$ = new Subject<void>();
  private pollingSubscription: Subscription;
  private isPollingActive = false;
  
  // 1 hour in milliseconds (can be configured)
  private pollingInterval = 60 * 60 * 1000;

  constructor() {
    this.startPolling();
  }

  /**
   * Get observable that emits every hour
   */
  get getPolling(): Observable<void> {
    return this.notifier$.asObservable().pipe(
      share() // Share among multiple subscribers
    );
  }

  /**
   * Start the hourly polling
   * @param immediate Whether to emit immediately (default: true)
   */
  startPolling(immediate: boolean = true): void {
    if (this.isPollingActive) return;
    
    this.isPollingActive = true;
    this.pollingSubscription = interval(this.pollingInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.notifier$.next();
      });
    
    // Emit immediately if requested
    if (immediate) {
      setTimeout(() => this.notifier$.next(), 0);
    }
  }

  /**
   * Stop the polling mechanism
   */
  stopPolling(): void {
    if (!this.isPollingActive) return;
    
    this.pollingSubscription?.unsubscribe();
    this.isPollingActive = false;
  }

  /**
   * Check if polling is active
   */
  get isActive(): boolean {
    return this.isPollingActive;
  }

  /**
   * Change the polling interval
   * @param intervalMs New interval in milliseconds
   * @param restart Whether to restart polling with new interval (default: true)
   */
  setInterval(intervalMs: number, restart: boolean = true): void {
    this.pollingInterval = intervalMs;
    if (restart && this.isPollingActive) {
      this.stopPolling();
      this.startPolling(false);
    }
  }

  /**
   * Manually trigger a notification
   */
  notify(): void {
    this.notifier$.next();
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
    this.notifier$.complete();
  }
}