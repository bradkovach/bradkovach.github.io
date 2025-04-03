import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { AcquireComponent } from './acquire.component';

describe('AcquireComponent', () => {
  let component: AcquireComponent;
  let fixture: ComponentFixture<AcquireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcquireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcquireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
