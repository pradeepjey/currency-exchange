import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly darkThemeClass = 'dark-theme';
  private readonly lightThemeClass = 'light-theme';
  private readonly storageKey = 'app-theme';

  constructor() {
    this.loadSavedTheme();
  }

  /**
   * Toggle theme
   * @param isDark - true or false for dark mode
   */
  toggleTheme(isDark: boolean): void {
    const body = document.body;

    if (isDark) {
      body.classList.add(this.darkThemeClass);
      body.classList.remove(this.lightThemeClass);
      localStorage.setItem(this.storageKey, this.darkThemeClass);
    } else {
      body.classList.remove(this.darkThemeClass);
      body.classList.add(this.lightThemeClass);
      localStorage.setItem(this.storageKey, this.lightThemeClass);
    }
  }

  /**
   * Get Active theme
   * @returns active theme
   */
  getActiveTheme(): 'dark' | 'light' {
    return document.body.classList.contains(this.darkThemeClass) ? 'dark' : 'light';
  }

  /**
   * To save a theme
   */
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme === this.darkThemeClass) {
      this.toggleTheme(true);
    } else {
      this.toggleTheme(false);
    }
  }
}
