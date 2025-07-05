import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewArrival } from './new-arrival';

describe('NewArrival', () => {
  let component: NewArrival;
  let fixture: ComponentFixture<NewArrival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewArrival]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewArrival);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});