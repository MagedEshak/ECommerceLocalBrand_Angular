import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousOrders } from './previous-orders';

describe('PreviousOrders', () => {
  let component: PreviousOrders;
  let fixture: ComponentFixture<PreviousOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousOrders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviousOrders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
