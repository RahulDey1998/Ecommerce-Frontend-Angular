import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterEvent } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormValidator } from 'src/app/validators/form-validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  
  totalPrice: number=0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  states: State[] = [];
  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, 
              private checkoutFormService: CheckoutFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group( {
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required,
                                       Validators.minLength(2), 
                                       FormValidator.notOnlyWhiteSpaces]),
        lastName: new FormControl('', [Validators.required, 
                                       Validators.minLength(2), 
                                       FormValidator.notOnlyWhiteSpaces]),
        email:  new FormControl('',
         [Validators.required,
   Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        street:new FormControl('', [Validators.required,
                               FormValidator.notOnlyWhiteSpaces]),
        city:new FormControl('', [Validators.required,
                               FormValidator.notOnlyWhiteSpaces]),
        state:new FormControl('', [Validators.required]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required,
                               FormValidator.notOnlyWhiteSpaces])
       }),  
       billingAddress: this.formBuilder.group({
        street:new FormControl('', [Validators.required,
                                    FormValidator.notOnlyWhiteSpaces]),
        city:new FormControl('', [Validators.required,
                                    FormValidator.notOnlyWhiteSpaces]),
        state:new FormControl('', [Validators.required]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required,
                                    FormValidator.notOnlyWhiteSpaces])
       }),
       creditCard: this.formBuilder.group({
        cardType:new FormControl('', [Validators.required]),
        nameOnCard:new FormControl('', [Validators.required,
                                       Validators.minLength(2)]),
        cardNumber:new FormControl('', [Validators.required,
                                     Validators.pattern('^[0-9]{16}$')]),
        securityGroup:new FormControl('', [Validators.required,
                                      Validators.pattern('^[0-9]{3}$')]),
        expirationMonth:[''],
        expirationYear:['']
       }),
    });

    //populate Credit Card Information from service
    const startMonth = new Date().getMonth() + 1;
    console.log("Start Month: " + startMonth);
    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe( 
      data => {
        console.log("Received credit card months : -" + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    this.checkoutFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Received credit card years : -" + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    //Getting countries from "Form - Service"
    this.checkoutFormService.getCountries().subscribe(
      data => {
        console.log("Countries Recieved : " + JSON.stringify(data));
        this.countries = data;
      }
    );

    //Subscribing to Quantity and Total price from Cart Service
    this.cartService.totalQuantity.subscribe(
      data => {
        console.log("Total Quantity Received : " + data);
        this.totalQuantity = data;
      }
    );
  
    this.cartService.totalPrice.subscribe(
      data => {
        console.log("Total Price Received : " + data);
        this.totalPrice = data;
      }
    );
  }

  onSubmit() {

    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched(); //Touching all fields will trigger the display of the error message  
      console.log("form validation failed")
    }
    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart item details
    const cartItems = this.cartService.cartItems;

    //create orderitems from cartItems
    let orderItems : OrderItem[]= cartItems.map(cartItem => new OrderItem(cartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate puchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
   

    //populate purchase  - shipping address,billing address,order
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems; 

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order tracking number : ${response.orderTrackingNumber}` );

          //reset cart
          this.resetCart();
        },
        error: error => {
         alert(`Error Occured : ${error.message}` );

        }
      }
    )
  }
  resetCart() {
    //reset cart data
    this.cartService.cartItems =[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset cart form
    this.checkoutFormGroup.reset();

    //navigate back to products page
    this.router.navigateByUrl("/products");
  }

  copyShippingAddressToBillingAddress(event){
    if(event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
             .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      
      this.billingAddressStates[0] = this.checkoutFormGroup.controls.shippingAddress.value;
   
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }

  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName');}
  get email() {return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode');}

  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardCardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityGroup() {return this.checkoutFormGroup.get('creditCard.securityGroup');}

  
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear = new Date().getFullYear();
    const selectedYear = creditCardFormGroup.value.expirationYear;

    //If the current year is equal to the selected year then start with the current month

    let startMonth: number;
    if(currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.checkoutFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }

  getStates(formGroupName: string) {
     const formGroup = this.checkoutFormGroup.get(formGroupName);
     const countryCode = formGroup.value.country.code;
     console.log("countryCode" + countryCode);
     const countryName = formGroup.value.country.name;
     this.checkoutFormService.getStates(countryCode).subscribe(
       data => {
        console.log(`Retrived States for country : ${countryName}  ->` + JSON.stringify(data));
        
        if(formGroupName == 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        formGroup.get('state').setValue(data[0]);
       }
     );
  }
  
}


