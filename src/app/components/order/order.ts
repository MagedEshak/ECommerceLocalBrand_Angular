import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import {
  IOrder,
  PaymentMethods,
  OrderStatus,
  ICustomer,
  IAddress,
} from '../../models/IOrder';
import { ICartItem } from '../../models/ICartItem';
import { environment } from '../../../environments/environment.development';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { OrderService } from '../services/Order/order.service';
import { Login } from '../login/login';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit, OnDestroy {
  addressSelectControl: any;
  addNewAddressControl: any;
  cartItems: ICartItem[] = [];
  governorates: { id: number; name: string; shippingCost: number }[] = [];
  shippingCost: number = 0;
  estimatedTotal: number = 0;
  private completedCheckout: boolean = false;
  private shouldContinueCheckout: boolean = false;
  validationErrors: { [key: string]: string[] } = {};

  orderForm: FormGroup;
  isLoggedInNow = false;

  paymentMethods = [
    { value: PaymentMethods.Online, label: 'Credit Card Or Mobile Wallet' },
    { value: PaymentMethods.COD, label: 'Cash on Delivery' },
  ];

  order: IOrder = {
    orderId: 0,
    orderNumber: '',
    createdAt: new Date(),
    deliveredAt: undefined,
    customerId: '',
    shippingCost: 0,
    discountValue: 0,
    totalOrderPrice: 0,
    paymentMethod: PaymentMethods.Online,
    orderStatus: OrderStatus.Created,
    orderItems: [],
    customerInfo: {} as ICustomer,
    addressInfo: {} as IAddress,
  };

  savedAddresses: any[] = [];
  useNewAddress: boolean = false;
  selectedAddressId: string | null = null;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)],
      ],
      paymentMethod: [null, Validators.required],
      street: ['', Validators.required],
      apartment: [''],
      building: [''],
      floor: [''],
      governrateShippingCostId: [null, Validators.required],
    });
    this.addressSelectControl = this.fb.control(null);
    this.addNewAddressControl = this.fb.control(false);
  }

  ngOnInit(): void {
    // Synchronize controls with component state
    this.addressSelectControl.valueChanges.subscribe((val: string | null) => {
      this.selectedAddressId = val;
      if (!this.useNewAddress) {
        this.onAddressChange();
      }
    });
    this.addNewAddressControl.valueChanges.subscribe((val: boolean | null) => {
      this.useNewAddress = !!val;
      this.onToggleNewAddress();
    });
    this.loadUserDataIfLoggedIn();
    this.loadGovernorates();

    // Pre-fill form if customerInfo is available
    if (this.order.customerInfo) {
      this.orderForm.patchValue({
        email: this.order.customerInfo.email || '',
        firstName: this.order.customerInfo.firstName || '',
        lastName: this.order.customerInfo.lastName || '',
        phoneNumber: this.order.customerInfo.phoneNumber || '',
      });
    }

    const nav = this.router.getCurrentNavigation();
    let buyNowItem = nav?.extras?.state?.['buyNowItem'];

    if (!buyNowItem) {
      const stored = sessionStorage.getItem('buyNowItem');
      if (stored) {
        try {
          buyNowItem = JSON.parse(stored);
        } catch {}
      }
    }

    if (buyNowItem) {
      this.cartItems = [
        {
          id: 0,
          productId: buyNowItem.productId,
          productSizeId: buyNowItem.productSizeId,
          productName: buyNowItem.productName,
          productSizeName: buyNowItem.productSizeName ?? '',
          productImageUrl: buyNowItem.productImageUrl?.startsWith('http')
            ? buyNowItem.productImageUrl
            : environment.baseServerUrl + buyNowItem.productImageUrl,
          quantity: buyNowItem.quantity,
          unitPrice: buyNowItem.unitPrice,
          totalPriceForOneItemType: buyNowItem.totalPriceForOneItemType,
        },
      ];
      this.calculateTotal();
      return;
    }

    const token = this.authService.getToken();
    if (token) {
      this.loadServerCart();
    } else {
      this.loadLocalCart();
    }
  }

  loadUserDataIfLoggedIn(): void {
    const token = this.authService.getToken();
    const user = token ? this.decodeUserFromToken(token) : null;

    if (user?.id) {
      this.order.customerId = user.id;

      this.orderService.getCustomerById(user.id).subscribe({
        next: (customerData) => {
          this.order.customerInfo = { ...customerData };
          // Patch form values when customer data is loaded
          this.orderForm.patchValue({
            email: customerData.email || '',
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            phoneNumber: customerData.phoneNumber || '',
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to fetch customer info.', err);
        },
      });

      this.loadAddresses(user.id);
    }
  }

  completeCheckout(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      alert('❌ Please complete all required fields correctly.');
      return;
    }
    const token = this.authService.getToken();
    const user = token ? this.decodeUserFromToken(token) : null;

    if (!user) {
      this.shouldContinueCheckout = true;
      const dialogRef = this.dialog.open(Login, {
        panelClass: 'no-padding-dialog',
        backdropClass: 'custom-backdrop',
        width: '100%',
        maxWidth: 'none',
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.token && result?.customerInfo) {
          this.authService.setLogin(result.token);
          this.loadUserDataIfLoggedIn();
          this.isLoggedInNow = true;
          setTimeout(() => this.cdr.detectChanges(), 0);
          if (this.shouldContinueCheckout) {
            this.shouldContinueCheckout = false;
            this.completeCheckout();
          }
        } else {
          alert('❌ You must log in before placing an order.');
        }
      });
      return;
    }

    if (this.cartItems.length === 0) {
      alert('❌ Your cart is empty.');
      return;
    }

    this.order.customerId = user.id;

    this.order.customerInfo = {
      email: this.orderForm.value.email,
      firstName: this.orderForm.value.firstName,
      lastName: this.orderForm.value.lastName,
      phoneNumber: this.orderForm.value.phoneNumber,
      dateOfBirth: new Date(), // not used in form, set to default date
    };
    this.order.addressInfo = {
      street: this.orderForm.value.street,
      apartment: this.orderForm.value.apartment,
      building: this.orderForm.value.building,
      floor: this.orderForm.value.floor,
      governrateShippingCostId: this.orderForm.value.governrateShippingCostId,
      city: '', // can be set from governorate selection logic
      country: 'Egypt', // default value
    };
    this.order.paymentMethod = this.orderForm.value.paymentMethod;

    this.orderService.getCustomerById(user.id).subscribe({
      next: (customerData) => {
        if (!customerData?.email || !customerData?.phoneNumber) {
          alert('❌ Please complete your profile before placing an order.');
          return;
        }
        this.prepareAndSendOrder();
      },
      error: () => {
        alert(
          '❌ Could not load your profile. Please complete your account first.'
        );
      },
    });
  }

  private prepareAndSendOrder(): void {
    this.order.orderItems = this.cartItems.map((item) => ({
      orderItemId: 0,
      productId: item.productId,
      productSizeId: item.productSizeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPriceForOneItemType,
    }));

    this.order.totalOrderPrice = this.estimatedTotal + this.shippingCost;

    // Ensure city is set before sending order
    if (
      !this.order.addressInfo.city ||
      this.order.addressInfo.city.trim() === ''
    ) {
      const govId = this.order.addressInfo.governrateShippingCostId;
      const selectedGov = this.governorates.find((gov) => gov.id === govId);
      if (selectedGov) {
        this.order.addressInfo.city = selectedGov.name;
      }
    }

    this.orderService.checkoutOrder(this.order).subscribe({
      next: (res) => {
        sessionStorage.removeItem('buyNowItem');
        this.completedCheckout = true;

        if (res?.intentionUrl && res.intentionUrl.trim() !== '') {
          window.location.href = res.intentionUrl;
          return;
        }

        this.router.navigate(['/thank-you']);
        Swal.fire({
          title: 'Order Placed Successfully',
          text: 'Your order has been placed successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.error('❌ Error during checkout:', err);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while placing your order. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  decodeUserFromToken(token: string): { id: string; email: string } {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
      email:
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
    };
  }

  calculateTotal(): void {
    this.estimatedTotal = this.cartItems.reduce(
      (acc, item) => acc + item.totalPriceForOneItemType,
      0
    );
  }

  loadServerCart(): void {
    this.cartService.getCurrentUserCart().subscribe({
      next: (res: any) => {
        const items = res?.cartItems ?? [];
        this.cartItems = items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.productName ?? 'Unknown',
          productSizeName: item.productSizeName ?? '',
          productImageUrl: item.productImageUrl
            ? environment.baseServerUrl + item.productImageUrl
            : '/assets/images/default.png',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
        }));

        this.calculateTotal();
      },
      error: (err) => {
        console.error('❌ Error fetching server cart:', err);
      },
    });
  }

  loadLocalCart(): void {
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      try {
        const rawItems = JSON.parse(storedCart);
        this.cartItems = rawItems.map((item: any) => ({
          id: 0,
          productId: item.productId,
          productSizeId: item.productSizeId,
          productName: item.name ?? 'Unknown',
          productSizeName: item.productSizeName ?? '',
          productImageUrl: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPriceForOneItemType: item.totalPriceForOneItemType,
        }));
        this.calculateTotal();
      } catch (e) {
        console.error('❌ Error parsing local guest cart:', e);
      }
    }
  }

  loadGovernorates(): void {
    this.orderService.getGovernorateShippingCosts().subscribe({
      next: (res) => {
        this.governorates = res;
      },
      error: (err) => {
        console.error('❌ Error loading governorates:', err);
      },
    });
  }

  onGovernorateChange(): void {
    // Always use the value from the form, not just addressInfo
    const govId = this.orderForm.value.governrateShippingCostId;
    const selectedGov = this.governorates.find((gov) => gov.id === govId);

    if (selectedGov) {
      this.order.addressInfo.governrateShippingCostId = selectedGov.id;
      this.order.addressInfo.city = selectedGov.name;
      this.shippingCost = selectedGov.shippingCost;
    } else {
      this.order.addressInfo.city = '';
      this.shippingCost = 0;
    }
  }

  loadAddresses(userId: string): void {
    this.orderService.getAddressesByUserId(userId).subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
      },
      error: (err) => {
        console.error('Error fetching addresses:', err);
      },
    });
  }

  onAddressChange(): void {
    if (!this.useNewAddress && this.selectedAddressId) {
      const selected = this.savedAddresses.find(
        (a) => a.id == this.selectedAddressId
      );
      if (selected) {
        const selectedGovForCity = this.governorates.find(
          (gov) => gov.id === selected.governrateShippingCostId
        );
        this.order.addressInfo = {
          id: selected.id,
          street: selected.street,
          apartment: selected.apartment,
          building: selected.building,
          floor: selected.floor,
          city: selectedGovForCity ? selectedGovForCity.name : selected.city,
          country: selected.country,
          governrateShippingCostId: selected.governrateShippingCostId,
        };
        // Patch form fields to match selected address
        this.orderForm.patchValue({
          street: selected.street || '',
          apartment: selected.apartment || '',
          building: selected.building || '',
          floor: selected.floor || '',
          governrateShippingCostId: selected.governrateShippingCostId ?? null,
        });
        // Update shipping cost immediately based on governorate
        const selectedGov = this.governorates.find(
          (gov) => gov.id === selected.governrateShippingCostId
        );
        if (selectedGov) {
          this.shippingCost = selectedGov.shippingCost;
        } else {
          this.shippingCost = 0;
        }
        this.cdr.detectChanges();
      }
    }
  }

  onToggleNewAddress(): void {
    if (this.useNewAddress) {
      this.selectedAddressId = null;
      this.order.addressInfo = {
        street: '',
        apartment: '',
        building: '',
        floor: '',
        city: '',
        country: '',
        governrateShippingCostId: 0,
      };
      // Clear address fields in the form
      this.orderForm.patchValue({
        street: '',
        apartment: '',
        building: '',
        floor: '',
        governrateShippingCostId: null,
      });
      this.cdr.detectChanges();
    } else {
      // If switching back, repopulate from selected address
      this.onAddressChange();
    }
  }

  ngOnDestroy(): void {
    if (!this.completedCheckout) {
      sessionStorage.removeItem('buyNowItem');
    }
  }

  trackByProductId(index: number, item: ICartItem): string {
    return item.productId + '-' + item.productSizeId;
  }
}
