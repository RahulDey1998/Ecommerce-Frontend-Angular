import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { min } from 'rxjs/operators';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems :CartItem[] = [];

  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(theCartItem: CartItem) {
    //checking if alredy present in cart
    let alredyExistInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    //finding the item in the cart based on the item id
    if(this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(cartItem => cartItem.id == theCartItem.id);
    }
  //check if we found it
  alredyExistInCart = (existingCartItem != undefined);

  if(alredyExistInCart) {
     existingCartItem.quantity++;
  }
  else {
    this.cartItems.push(theCartItem);
  }

  //compute cart total price and quantity
  this.computeCartTotal();


  }
  computeCartTotal() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity + currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // Publish the new value, All Subsriber will receive the value
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
     console.log("Logging Cart Item Details");
     for(let cartItem of this.cartItems) {
       const subTotal = cartItem.quantity * cartItem.unitPrice;
       console.log(`Name : ${cartItem.name} Qty : ${cartItem.quantity} Price : ${cartItem.unitPrice} SubTotal : ${subTotal}`);
     }

     console.log(`Total Price : ${totalPriceValue.toFixed(2)}, Total Qty : ${totalQuantityValue}`);
     console.log('------------');
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;
    if(cartItem.quantity == 0) {
      this.remove(cartItem);
    }
    else {
      this.computeCartTotal();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == cartItem.id);
    
    if(itemIndex > -1) {
      this.cartItems.splice(itemIndex,1);
    }
    this.computeCartTotal();
  }

}
