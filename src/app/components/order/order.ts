import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { IOrder, PaymentMethods, OrderStatus, ICustomer, IAddress } from '../../models/IOrder';
import { ICartItem } from '../../models/ICartItem';
import { environment } from '../../../environments/environment.development';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../shared/services/Order/order.service';
import { Login } from '../login/login';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit, OnDestroy {
  cartItems: ICartItem[] = [];
  governorates: { id: number; name: string; shippingCost: number }[] = [];
  shippingCost: number = 0;
  estimatedTotal: number = 0;
  private completedCheckout: boolean = false;
  private shouldContinueCheckout: boolean = false;

  orderForm = { paymentMethod: PaymentMethods.Online };
  isLoggedInNow = false;

  paymentMethods = [
    { value: PaymentMethods.Online, label: 'Credit Card Or Mobile Wallet' },
    { value: PaymentMethods.COD, label: 'Cash on Delivery' }
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
    addressInfo: {} as IAddress
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserDataIfLoggedIn();
    this.loadGovernorates();

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
      this.cartItems = [{
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
      }];
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Failed to fetch customer info.', err);
        }
      });

      this.loadAddresses(user.id);
    }
  }

  completeCheckout(): void {
    const token = this.authService.getToken();
    const user = token ? this.decodeUserFromToken(token) : null;

    if (!user) {
      this.shouldContinueCheckout = true;

      const dialogRef = this.dialog.open(Login, {
        width: '500px',
        disableClose: true
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

if (this.orderForm.paymentMethod === null || this.orderForm.paymentMethod === undefined) {
  alert('Please select a payment method');
  return;
}


    if (this.cartItems.length === 0) {
      alert('❌ Your cart is empty.');
      return;
    }

    this.order.customerId = user.id;

    this.orderService.getCustomerById(user.id).subscribe({
      next: (customerData) => {
        if (!customerData?.email || !customerData?.phoneNumber) {
          alert('❌ Please complete your profile before placing an order.');
          return;
        }

        this.order.customerInfo = { ...customerData };
        this.order.paymentMethod = this.orderForm.paymentMethod!;
        this.prepareAndSendOrder();
      },
      error: () => {
        alert('❌ Could not load your profile. Please complete your account first.');
      }
    });
  }

  private prepareAndSendOrder(): void {
    this.order.orderItems = this.cartItems.map((item) => ({
      orderItemId: 0,
      productId: item.productId,
      productSizeId: item.productSizeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPriceForOneItemType
    }));

    this.order.totalOrderPrice = this.estimatedTotal + this.shippingCost;

    this.orderService.checkoutOrder(this.order).subscribe({
      next: (res) => {
        sessionStorage.removeItem('buyNowItem');
        this.completedCheckout = true;

        if (res?.intentionUrl && res.intentionUrl.trim() !== '') {
          window.location.href = res.intentionUrl;
          return;
        }

        this.router.navigate(['/thank-you']);
      },
      error: (err) => {
        console.error('❌ Error during checkout:', err);
      }
    });
  }

  decodeUserFromToken(token: string): { id: string; email: string } {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
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
          productImageUrl: item.image
            ? environment.baseServerUrl + item.image
            : '/assets/images/default.png',
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
      }
    });
  }

  onGovernorateChange(): void {
    const selectedGov = this.governorates.find(
      gov => gov.id === this.order.addressInfo.governrateShippingCostId
    );

    if (selectedGov) {
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
      }
    });
  }

  onAddressChange(): void {
    const selected = this.savedAddresses.find(a => a.id == this.selectedAddressId);
    if (selected) {
      this.order.addressInfo = {
  id: selected.id,
  street: selected.street,
  apartment: selected.apartment,
  building: selected.building,
  floor: selected.floor,
  city: selected.city,
  country: selected.country,
  governrateShippingCostId: selected.governrateShippingCostId,
      };
      this.onGovernorateChange();
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
