import { TestBed } from '@angular/core/testing';

import { PreviousOrder } from './previous-orders';

describe('PreviousOrders', () => {
  let service: PreviousOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviousOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
