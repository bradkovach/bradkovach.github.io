import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceGasIndexComponent } from './choice-gas-index.component';

describe('ChoiceGasIndexComponent', () => {
  let component: ChoiceGasIndexComponent;
  let fixture: ComponentFixture<ChoiceGasIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceGasIndexComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChoiceGasIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
