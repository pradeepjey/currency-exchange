import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextSearchComponent } from './text-search.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { jasmineExpect } from '../../../test-helpers';

describe('TextSearchComponent', () => {
  let component: TextSearchComponent;
  let fixture: ComponentFixture<TextSearchComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, // Required for Material animations
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        TextSearchComponent // Include the component in imports since it's standalone
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextSearchComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    // Set input label
    fixture.componentRef.setInput('label', 'Search');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    jasmineExpect(component).toBeTruthy();
  });

  it('should emit value when triggerResults is called', () => {
    // Arrange - spy on the output emitter
    spyOn(component.inputChanged, 'emit');
    
    // Act - call the method with a test value
    component.triggerResults('test value');
    
    // Assert - check that the emitter was called with the correct value
    jasmineExpect(component.inputChanged.emit).toHaveBeenCalledWith('test value');
  });

  it('should clear the search text and emit empty value when clearSearch is called', () => {
    // Arrange - set an initial value
    component.searchText.setValue('initial text');
    spyOn(component.inputChanged, 'emit');
    
    // Act - call the clear method
    component.clearSearch();
    
    // Assert - check the form control was reset and the event was emitted with null
    jasmineExpect(component.searchText.value).toBeNull();
    jasmineExpect(component.inputChanged.emit).toHaveBeenCalledWith(null);
  });

  it('should trigger results with current text value when onKeyup is called', async () => {
    // Arrange
    spyOn(component, 'triggerResults');
    
    // Get input element using Angular Material testing harness
    const input = await loader.getHarness(MatInputHarness);
    
    // Act - set value and trigger keyup
    await input.setValue('test input');
    component.onKeyup();
    
    // Assert - check that triggerResults was called with the correct value
    jasmineExpect(component.triggerResults).toHaveBeenCalledWith('test input');
  });
});
