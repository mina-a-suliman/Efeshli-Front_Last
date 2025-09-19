import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CartItemsComponent} from  './cart-items'; 

describe('CartItemsComponent', () => {
  let component: CartItemsComponent; // غيرت من CartItems
  let fixture: ComponentFixture<CartItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemsComponent] // غيرت من CartItems
    }).compileComponents();

    fixture = TestBed.createComponent(CartItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call startShopping', () => {
    spyOn(console, 'log');
    component.startShopping();
    expect(console.log).toHaveBeenCalledWith('Redirecting to shop...');
  });
});