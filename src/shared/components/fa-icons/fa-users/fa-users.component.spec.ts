import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaUsersComponent } from './fa-users.component';

describe('FaUsersComponent', () => {
  let component: FaUsersComponent;
  let fixture: ComponentFixture<FaUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
