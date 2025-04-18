import type { ComponentFixture} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import { DataEditorComponent } from './data-editor.component';

describe('DataEditorComponent', () => {
  let component: DataEditorComponent;
  let fixture: ComponentFixture<DataEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
