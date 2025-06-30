/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProdductsService } from './prodducts.service';

describe('Service: Prodducts', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProdductsService]
    });
  });

  it('should ...', inject([ProdductsService], (service: ProdductsService) => {
    expect(service).toBeTruthy();
  }));
});
