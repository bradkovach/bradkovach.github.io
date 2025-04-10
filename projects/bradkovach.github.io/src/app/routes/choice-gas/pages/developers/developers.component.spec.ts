import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { DevelopersComponent } from './developers.component';

describe('DevelopersComponent', () => {
  let component: DevelopersComponent;
  let fixture: ComponentFixture<DevelopersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DevelopersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
