import { TestBed } from '@angular/core/testing';
import { ContactUsService } from './contct-us.service';
describe('ContctUs', () => {
  let service: ContactUsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactUsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
