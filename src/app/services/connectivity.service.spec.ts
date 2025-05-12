// connectivity.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ConnectivityService } from './connectivity.service';
import { NgZone } from '@angular/core';
import { jasmineExpect } from '../../test-helpers';

describe('ConnectivityService', () => {
  let service: ConnectivityService;
  let ngZone: NgZone;
  let onlineListeners: Function[] = [];
  let offlineListeners: Function[] = [];

  // Mock window event listeners
  const originalAddEventListener = window.addEventListener;
  const originalNavigatorOnline = navigator.onLine;

  beforeEach(() => {
    // Reset listener arrays
    onlineListeners = [];
    offlineListeners = [];

    // Mock window.addEventListener
    // @ts-ignore
    window.addEventListener = (event: string, listener: Function) => {
      if (event === 'online') {
        onlineListeners.push(listener);
      } else if (event === 'offline') {
        offlineListeners.push(listener);
      }
    };

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });

    TestBed.configureTestingModule({
      providers: [ConnectivityService]
    });

    ngZone = TestBed.inject(NgZone);
    service = TestBed.inject(ConnectivityService);
  });

  afterEach(() => {
    // Restore original functions
    window.addEventListener = originalAddEventListener;
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalNavigatorOnline
    });
  });

  it('should be created', () => {
    jasmineExpect(service).toBeTruthy();
  });

  // Verify the service initializes with the correct online status
  it('should initialize with the correct online status from navigator.onLine', () => {
    // Verify initial value
    jasmineExpect(service.isOnline).toBe(true);
    
  });

  // Verify that online/offline events trigger status updates
  it('should update status when online/offline events are triggered', (done) => {
    // Initial state should be online (true)
    jasmineExpect(service.isOnline).toBe(true);
    
    // Subscribe to changes
    const statusChanges: boolean[] = [];
    const subscription = service.isOnline$.subscribe(status => {
      statusChanges.push(status);
      
      // After we've received 3 values (initial + offline + online), check results
      if (statusChanges.length === 3) {
        jasmineExpect(statusChanges).toEqual([true, false, true]);
        subscription.unsubscribe();
        done();
      }
    });
    
    // Simulate going offline
    ngZone.run(() => {
      // Trigger all offline listeners
      offlineListeners.forEach(listener => listener());
    });
    
    // Verify synchronous check matches
    jasmineExpect(service.isOnline).toBe(false);
    
    // Simulate going back online
    ngZone.run(() => {
      // Trigger all online listeners
      onlineListeners.forEach(listener => listener());
    });
    
    // Verify synchronous check matches
    jasmineExpect(service.isOnline).toBe(true);
  });
});