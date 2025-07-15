import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CartItemService } from '../../shared/services/cart/cart.service';
import { AuthService } from '../../shared/services/Auth/auth.service';
import { IOrder, IOrderItem, PaymentMethods, OrderStatus } from '../../models/IOrder';
import { ICartItem } from '../../models/ICartItem';
import { environment } from '../../../environments/environment.development';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ICustomer } from '../../models/IOrder';
import { IAddress } from '../../models/IOrder';
import { OrderService } from '../services/Order/order.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule, FormsModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit, OnDestroy {
  cartItems: ICartItem[] = [];
governorates: { id: number; name: string }[] = [];

  order: IOrder = {
    orderId: 0,
    orderNumber: '',
    createdAt: new Date(),
    deliveredAt: undefined,
    customerId: '',
    shippingCost: 100,
    discountValue: 0,
    totalOrderPrice: 0,
    paymentMethod: PaymentMethods.OnlineCard,
    orderStatus: OrderStatus.Created,
    orderItems: [],
    customerInfo: {} as ICustomer,
    addressInfo: {} as IAddress
  };

  shippingCost: number = 100;
  estimatedTotal: number = 0;
  private completedCheckout: boolean = false;

  constructor(
    private cartService: CartItemService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  orderForm = {
    paymentMethod: null
  };

  paymentMethods = [
    { value: PaymentMethods.OnlineCard, label: 'Credit Card' },
    { value: PaymentMethods.MobileWallet, label: 'Mobile Wallet' },
    { value: PaymentMethods.COD, label: 'Cash on Delivery' }
  ];

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    let buyNowItem = nav?.extras?.state?.['buyNowItem'];
      this.loadUserAddresses();
  this.loadGovernorates();
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
          productSizeName: buyNowItem.productSizeName,
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

loadGovernorates(): void {
  this.orderService.getGovernorates().subscribe({
    next: (res) => {
      this.governorates = res;
    },
    error: (err) => {
      console.error('❌ Error loading governorates:', err);
    }
  });
}
savedAddresses: any[] = []; // أو اعملها interface لو حابب
useNewAddress: boolean = false;
selectedAddressId: string | null = null;

loadUserAddresses() {
  this.orderService.getUserAddresses().subscribe({
    next: (addresses) => {
      this.savedAddresses = addresses;
    },
    error: (err) => {
      console.error("❌ Error loading addresses", err);
    }
  });
}
onAddressChange() {
  const selected = this.savedAddresses.find(a => a.id == this.selectedAddressId);
  if (selected) {
    this.order.addressInfo = {
      street: selected.street,
      apartment: selected.apartment,
      building: selected.building,
      floor: selected.floor,
      city: selected.city,
      country: selected.country,
      governrateShippingCostId: selected.governrateShippingCostId
    };
  }
}

onToggleNewAddress() {
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

  calculateTotal(): void {
    this.estimatedTotal = this.cartItems.reduce(
      (acc, item) => acc + item.totalPriceForOneItemType,
      0
    );
  }

  completeCheckout(): void {
    if (!this.orderForm.paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    this.order.paymentMethod = this.orderForm.paymentMethod;
    this.order.orderItems = this.cartItems.map((item) => ({
      orderItemId: 0,
      productId: item.productId,
      productSizeId: item.productSizeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPriceForOneItemType
    }));
    this.order.totalOrderPrice = this.estimatedTotal + this.shippingCost;

    const user = this.authService.getToken() ? this.decodeUserFromToken(this.authService.getToken()!) : null;
    if (user) {
      this.order.customerId = user.id;
    }

    console.log('🚀 Order ready to send:', this.order);

    this.completedCheckout = true;
    sessionStorage.removeItem('buyNowItem');
    this.router.navigate(['/thank-you']);
  }

  decodeUserFromToken(token: string): { id: string } | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { id: payload?.sub || payload?.userId || '' };
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    if (!this.completedCheckout) {
      sessionStorage.removeItem('buyNowItem');
    }
  }
}
