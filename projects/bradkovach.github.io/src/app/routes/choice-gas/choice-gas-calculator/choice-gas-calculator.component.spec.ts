import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceGasCalculatorComponent } from './choice-gas-calculator.component';

describe('ChoiceGasCalculatorComponent', () => {
  let component: ChoiceGasCalculatorComponent;
  let fixture: ComponentFixture<ChoiceGasCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceGasCalculatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoiceGasCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
