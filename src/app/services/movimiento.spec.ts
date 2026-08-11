import { TestBed } from '@angular/core/testing';

import { Movimiento } from './movimiento';

describe('Movimiento', () => {
  let service: Movimiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Movimiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
