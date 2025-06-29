import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rgisteration } from './rgisteration';

describe('Rgisteration', () => {
  let component: Rgisteration;
  let fixture: ComponentFixture<Rgisteration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rgisteration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rgisteration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
