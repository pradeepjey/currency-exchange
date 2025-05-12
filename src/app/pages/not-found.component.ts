import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="not-found-card">
      <mat-card-content class="content">
        <div class="error-code">404</div>
        <h1 class="mat-headline-4">Page Not Found</h1>
        <p class="mat-body-1">The page you're looking for doesn't exist or has been moved.</p>
        <button mat-raised-button color="primary" (click)="goHome()">
          Return to Homepage
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .not-found-card {
      max-width: 500px;
      text-align: center;
      padding: 2rem;
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .error-code {
      font-size: 5rem;
      font-weight: bold;
      color: #f44336;  /* Material Red 500 */
      line-height: 1;
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  /**
   * Navigate to home page when clicked on 'Return to Homepage' button
   */
  goHome() {
    this.router.navigate(['/']);
  }
}