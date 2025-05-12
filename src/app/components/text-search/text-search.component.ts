import { Component, input, output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-search',
  imports: [
    // Material components
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,

    // Angular Forms
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: './text-search.component.html',
  styleUrl: './text-search.component.scss'
})
export class TextSearchComponent {
  label = input<string>();
  inputChanged = output<string | null>();
  searchText = new FormControl('');

  constructor() {}

  /**
   * Clears Search text
   */
  clearSearch() {
    this.searchText.reset();
    this.triggerResults(this.searchText.value);
  }

  /**
   * Input keyup event
   */
  onKeyup() {
    const inputValue = this.searchText.value;
    this.triggerResults(inputValue);
  }

  /**
   * Emit input changes to parent component
   * @param value - A string value represent current input value
   */
  triggerResults(value: string | null) {
    this.inputChanged.emit(value);
  }
}
