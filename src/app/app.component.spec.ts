import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { jasmineExpect } from '../test-helpers';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])], // Add RouterModule
      providers: [
        { provide: ActivatedRoute, useValue: {} } // Mock ActivatedRoute
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    // console.log(typeof expect); 
    console.log("type of expect", typeof expect); 
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    jasmineExpect(app).toBeTruthy();
  });
});
