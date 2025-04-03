import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { BillTotalComponent } from './bill-total.component';

describe('BillTotalComponent', () => {
  let component: BillTotalComponent;
  let fixture: ComponentFixture<BillTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillTotalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
