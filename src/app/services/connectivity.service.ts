import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(private ngZone: NgZone) {
    // Use NgZone to ensure changes trigger Angular's change detection
    window.addEventListener('online', () => {
      this.ngZone.run(() => this.updateStatus(true));
    });

    window.addEventListener('offline', () => {
      this.ngZone.run(() => this.updateStatus(false));
    });
  }

  private updateStatus(status: boolean) {
    this.onlineStatus$.next(status);
  }

  /**
   * Observable to subscribe to connection status changes.
   */
  get isOnline$(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  /**
   * Synchronous check for current status.
   */
  get isOnline(): boolean {
    return this.onlineStatus$.value;
  }
}
