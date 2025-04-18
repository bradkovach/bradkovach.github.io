import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { SolveComponent } from './solve.component';

describe('SolveComponent', () => {
  let component: SolveComponent;
  let fixture: ComponentFixture<SolveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
