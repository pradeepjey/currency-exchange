import { Component, Output, EventEmitter, Input } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { ThemeSwitchComponent } from '../../components/theme-switch/theme-switch.component';

@Component({
  selector: 'app-header',
  imports: [
    // Material components
    MatButtonModule, 
    MatToolbarModule, 
    MatIconModule, 
    
    // Child components
    ThemeSwitchComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
  @Input() pageTitle: string = 'Currency Exchange';

  constructor() {}

}
