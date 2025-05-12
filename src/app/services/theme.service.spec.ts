// theme.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { jasmineExpect } from '../../test-helpers';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: { [key: string]: string } = {};
  let documentBodyClassList: string[] = [];

  beforeEach(() => {
    // Reset mocks before each test
    mockLocalStorage = {};
    documentBodyClassList = [];

    // Mock localStorage
    spyOn(Storage.prototype, 'getItem').and.callFake((key) => {
      return mockLocalStorage[key] || null;
    });
    
    spyOn(Storage.prototype, 'setItem').and.callFake((key, value) => {
      mockLocalStorage[key] = value.toString();
    });

    // Mock document.body.classList
    spyOn(document.body.classList, 'add').and.callFake((className) => {
      if (!documentBodyClassList.includes(className)) {
        documentBodyClassList.push(className);
      }
    });
    
    spyOn(document.body.classList, 'remove').and.callFake((className) => {
      const index = documentBodyClassList.indexOf(className);
      if (index !== -1) {
        documentBodyClassList.splice(index, 1);
      }
    });
    
    spyOn(document.body.classList, 'contains').and.callFake((className) => {
      return documentBodyClassList.includes(className);
    });

    TestBed.configureTestingModule({
      providers: [ThemeService]
    });
    
    // Spy on loadSavedTheme to prevent it from running during initialization
    // This lets us test it separately
    spyOn(ThemeService.prototype, 'loadSavedTheme' as any).and.callFake(() => {});
    
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    jasmineExpect(service).toBeTruthy();
  });

  // Test Case 1: toggleTheme should update DOM and localStorage correctly
  it('should correctly apply dark and light themes when toggling', () => {
    // Test toggling to dark theme
    service.toggleTheme(true);
    
    // Verify DOM classes were updated correctly
    jasmineExpect(document.body.classList.add).toHaveBeenCalledWith('dark-theme');
    jasmineExpect(document.body.classList.remove).toHaveBeenCalledWith('light-theme');
    
    // Verify localStorage was updated
    jasmineExpect(Storage.prototype.setItem).toHaveBeenCalledWith('app-theme', 'dark-theme');
    
    // Reset call counts
    (document.body.classList.add as jasmine.Spy).calls.reset();
    (document.body.classList.remove as jasmine.Spy).calls.reset();
    (Storage.prototype.setItem as jasmine.Spy).calls.reset();
    
    // Test toggling to light theme
    service.toggleTheme(false);
    
    // Verify DOM classes were updated correctly
    jasmineExpect(document.body.classList.remove).toHaveBeenCalledWith('dark-theme');
    jasmineExpect(document.body.classList.add).toHaveBeenCalledWith('light-theme');
    
    // Verify localStorage was updated
    jasmineExpect(Storage.prototype.setItem).toHaveBeenCalledWith('app-theme', 'light-theme');
  });

  // Test Case 2: getActiveTheme should return the correct theme
  it('should return the correct active theme', () => {
    // Setup: Add dark-theme class to simulate dark theme being active
    document.body.classList.add('dark-theme');
    documentBodyClassList.push('dark-theme');
    
    // Call the method
    const result = service.getActiveTheme();
    
    // Verify contains was called with the correct class
    jasmineExpect(document.body.classList.contains).toHaveBeenCalledWith('dark-theme');
    
    // Verify the correct theme was returned
    jasmineExpect(result).toBe('dark');
    
    // Reset calls and classList
    (document.body.classList.contains as jasmine.Spy).calls.reset();
    documentBodyClassList = ['light-theme'];
    
    // Call the method again
    const lightResult = service.getActiveTheme();
    
    // Verify contains was called with the correct class
    jasmineExpect(document.body.classList.contains).toHaveBeenCalledWith('dark-theme');
    
    // Verify the correct theme was returned
    jasmineExpect(lightResult).toBe('light');
  });

  // Bonus Test Case: loadSavedTheme should load the correct theme from localStorage
  it('should load the saved theme from localStorage on initialization', () => {
    // Restore the original method for this test
    (service as any).loadSavedTheme.and.callThrough();
    
    // Spy on toggleTheme to check how it's called
    spyOn(service, 'toggleTheme');
    
    // Case 1: Dark theme in localStorage
    mockLocalStorage['app-theme'] = 'dark-theme';
    
    // Call the method
    (service as any).loadSavedTheme();
    
    // Verify toggleTheme was called with correct parameter
    jasmineExpect(service.toggleTheme).toHaveBeenCalledWith(true);
    
    // Reset spy call count
    (service.toggleTheme as jasmine.Spy).calls.reset();
    
    // Case 2: Light theme in localStorage
    mockLocalStorage['app-theme'] = 'light-theme';
    
    // Call the method
    (service as any).loadSavedTheme();
    
    // Verify toggleTheme was called with correct parameter
    jasmineExpect(service.toggleTheme).toHaveBeenCalledWith(false);
    
    // Reset spy call count
    (service.toggleTheme as jasmine.Spy).calls.reset();
    
    // Case 3: No theme in localStorage (default)
    mockLocalStorage = {};
    
    // Call the method
    (service as any).loadSavedTheme();
    
    // Verify toggleTheme was called with false (default to light)
    jasmineExpect(service.toggleTheme).toHaveBeenCalledWith(false);
  });
});