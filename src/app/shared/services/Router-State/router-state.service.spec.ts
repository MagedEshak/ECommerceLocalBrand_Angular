import { RouterStateService } from './router-state.service';
import { TestBed } from '@angular/core/testing';



describe('RouterStateService', () => {
  let service: RouterStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
