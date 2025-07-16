import { RefundOrderService } from './refund-order.service';
import { TestBed } from '@angular/core/testing';

describe('RefundOrderService', () => {
  let service: RefundOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefundOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
