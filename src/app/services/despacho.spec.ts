import { TestBed } from '@angular/core/testing';

import { Despacho } from './despacho';

describe('Despacho', () => {
  let service: Despacho;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Despacho);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
