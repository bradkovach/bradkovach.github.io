import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { IntegerComponent } from './integer.component';

describe('IntegerComponent', () => {
  let component: IntegerComponent;
  let fixture: ComponentFixture<IntegerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntegerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntegerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
