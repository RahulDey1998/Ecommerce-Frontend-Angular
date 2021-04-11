import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.updateCartStatus();
  } 
  updateCartStatus() {
    //subscribe to the cart Total Price
   this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    //scubscribe to the cart Total Quantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

  }
}
