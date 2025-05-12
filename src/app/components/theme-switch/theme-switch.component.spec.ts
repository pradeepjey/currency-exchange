import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSwitchComponent } from './theme-switch.component';
import { ThemeService } from '../../services/theme.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { jasmineExpect } from '../../../test-helpers';


// Mock for ThemeService
class MockThemeService {
  private activeTheme = 'light';

  getActiveTheme() {
    return this.activeTheme;
  }

  toggleTheme(isDark: boolean) {
    this.activeTheme = isDark ? 'dark' : 'light';
    return this.activeTheme;
  }
}


describe('ThemeSwitchComponent', () => {
  let component: ThemeSwitchComponent;
  let fixture: ComponentFixture<ThemeSwitchComponent>;
  let themeService: ThemeService;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSlideToggleModule,
        BrowserAnimationsModule,
        ThemeSwitchComponent
      ],
      providers: [
        { provide: ThemeService, useClass: MockThemeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeSwitchComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it('should create', () => {
    jasmineExpect(component).toBeTruthy();
  });

  it('should initialize with correct theme from ThemeService', () => {
    // Arrange
    spyOn(themeService, 'getActiveTheme').and.returnValue('light');
    
    // Act - create a new instance to trigger constructor logic
    fixture = TestBed.createComponent(ThemeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Assert - component should initialize with light theme (isDarkTheme = false)
    jasmineExpect(component.isDarkTheme).toBeFalse();
    jasmineExpect(themeService.getActiveTheme).toHaveBeenCalled();
    
    // Test with dark theme
    (themeService.getActiveTheme as jasmine.Spy).and.returnValue('dark');
    
    // Act - create another instance
    fixture = TestBed.createComponent(ThemeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Assert - component should initialize with dark theme
    jasmineExpect(component.isDarkTheme).toBeTrue();
  });

  it('should toggle theme when slide toggle is clicked', async () => {
    // Arrange
    spyOn(themeService, 'toggleTheme').and.callThrough();
    
    // Get the slide toggle using Angular Material testing harness
    const slideToggle = await loader.getHarness(MatSlideToggleHarness);
    
    // Initial state - should be unchecked/light theme
    jasmineExpect(await slideToggle.isChecked()).toBeFalse();
    
    // Act - toggle to dark theme
    await slideToggle.toggle();
    fixture.detectChanges();
    
    // Assert - component should update and service should be called
    jasmineExpect(component.isDarkTheme).toBeTrue();
    jasmineExpect(themeService.toggleTheme).toHaveBeenCalledWith(true);
    
    // Act - toggle back to light theme
    await slideToggle.toggle();
    fixture.detectChanges();
    
    // Assert - should be back to light theme
    jasmineExpect(component.isDarkTheme).toBeFalse();
    jasmineExpect(themeService.toggleTheme).toHaveBeenCalledWith(false);
  });
});
