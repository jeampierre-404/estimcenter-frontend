import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmployeeForm } from './admin-employee-form';

describe('AdminEmployeeForm', () => {
  let component: AdminEmployeeForm;
  let fixture: ComponentFixture<AdminEmployeeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEmployeeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEmployeeForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
