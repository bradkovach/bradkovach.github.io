import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceGasSettingsComponent } from './choice-gas-settings.component';

describe('ChoiceGasSettingsComponent', () => {
  let component: ChoiceGasSettingsComponent;
  let fixture: ComponentFixture<ChoiceGasSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceGasSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoiceGasSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
