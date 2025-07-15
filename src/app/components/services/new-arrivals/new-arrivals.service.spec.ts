import { TestBed } from '@angular/core/testing';

import { NewArrivalsService } from './new-arrivals.service';

describe('NewArrivalsService', () => {
  let service: NewArrivalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewArrivalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
