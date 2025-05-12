import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-theme-switch',
  imports: [
    // Material component
    MatSlideToggleModule
  ],
  templateUrl: './theme-switch.component.html',
  styleUrl: './theme-switch.component.scss'
})
export class ThemeSwitchComponent {
  isDarkTheme: boolean = false;

  constructor(private themeService: ThemeService) {
    this.isDarkTheme = this.themeService.getActiveTheme() === 'dark';
  }

  /**
   * Theme switch toggle
   * @param event - switch event with checked as true or false
   * @returns void
   */
  onThemeToggle(event: any): void {
    this.isDarkTheme = event.checked;
    this.themeService.toggleTheme(this.isDarkTheme);
  }
}
