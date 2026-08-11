import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuoteDetail } from './admin-quote-detail';

describe('AdminQuoteDetail', () => {
  let component: AdminQuoteDetail;
  let fixture: ComponentFixture<AdminQuoteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuoteDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQuoteDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
