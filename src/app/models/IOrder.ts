export interface IOrder {
  orderId?: number;
  orderNumber?: string;
  createdAt?: Date;
  deliveredAt?: Date;
  customerId: string;
  shippingCost?: number;
  discountValue: number;
  totalOrderPrice: number;
  paymentMethod: PaymentMethods;
  orderStatus: OrderStatus;
  orderItems: IOrderItem[];
  customerInfo: ICustomer;
  addressInfo: IAddress;
}
export interface IOrderItem {
  orderItemId: number;
  productId: number;
  quantity: number;
  productSizeId: number;
  totalPrice: number;
}

// order-status.enum.ts

export enum OrderStatus {
  Created = 0,
  AwaitingPayment = 1,
  Processing = 2,
  Cancelled = 3,
  Returned = 4
}

export enum PaymentMethods {
  OnlineCard = 0,
  MobileWallet = 1,
  COD = 2
}

export interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
}
export interface IAddress {
  id?: number; // nullable => optional
  street: string;
  city: string;
  governrateShippingCostId: number;
  country: string;
  apartment: string;
  building: string;
  floor: string;
}
