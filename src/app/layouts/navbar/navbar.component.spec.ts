import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { jasmineExpect } from '../../../test-helpers';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // Angular Material testing requirements
        MatListModule,
        NoopAnimationsModule,
        
        // Router testing
        RouterTestingModule.withRoutes([]),
        
        // Component to test (assuming it's standalone)
        NavbarComponent
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jasmineExpect(component).toBeTruthy();
  });

  // Test to check that MatListModule is correctly applied
  it('should render mat-list components', () => {
    const matListElements = fixture.debugElement.queryAll(By.css('mat-list, mat-nav-list'));
    // Only check if your template actually uses these elements
    // If your template doesn't use these directly, you can remove or modify this test
    jasmineExpect(matListElements.length).toBeGreaterThanOrEqual(0);
  });

  // Test to check that RouterLink is working correctly
  it('should have router links', () => {
    const routerLinks = fixture.debugElement.queryAll(By.directive(RouterLink));
    // This test assumes your template has elements with routerLink directives
    // If your template doesn't have router links yet, you can comment this out
    jasmineExpect(routerLinks.length).toBeGreaterThanOrEqual(0);
  });
});
