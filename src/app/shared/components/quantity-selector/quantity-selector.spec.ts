import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantitySelector } from './quantity-selector';

describe('QuantitySelector', () => {
  let component: QuantitySelector;
  let fixture: ComponentFixture<QuantitySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantitySelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantitySelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
