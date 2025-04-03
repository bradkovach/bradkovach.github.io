import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { ChoiceGasComponent } from './choice-gas.component';

describe('OutletComponent', () => {
  let component: ChoiceGasComponent;
  let fixture: ComponentFixture<ChoiceGasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceGasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChoiceGasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
