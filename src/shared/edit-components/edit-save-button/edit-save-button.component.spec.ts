import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaveButtonComponent } from './edit-save-button.component';

describe('EditSaveButtonComponent', () => {
  let component: EditSaveButtonComponent;
  let fixture: ComponentFixture<EditSaveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSaveButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
