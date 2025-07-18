import { IPreviousOrder } from './../../models/iprevious-order';
import { Component, effect, OnInit } from '@angular/core';
import { RefundOrderService } from './../../shared/services/refund-order/refund-order.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { iPreviousOrderItem } from '../../models/iPreviousOrderItem';

@Component({
  selector: 'app-previous-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './previous-orders.html',
  styleUrl: './previous-orders.css',
})
export class PreviousOrders implements OnInit {
  selectedOrderId: number | null = null;
  refundReason = '';
  showRefundForm = false;

  IPreviousOrder!: IPreviousOrder;
  IPreviousOrderitem!: iPreviousOrderItem;

  constructor(private refundOrderService: RefundOrderService) {}

  get refundStatus() {
    return this.refundOrderService.refundStatus;
  }

  get refundMessage() {
    return this.refundOrderService.refundMessage;
  }

  ngOnInit(): void {
    effect(() => {
      const status = this.refundStatus();
      if (status === 'success' || status === 'error') {
        setTimeout(() => {
          this.refundOrderService.resetRefundState();
        }, 4000);
      }
    });
  }

  openRefundForm(orderId: number) {
    this.selectedOrderId = orderId;
    this.showRefundForm = true;
  }

  submitRefund() {
    if (!this.selectedOrderId || !this.refundReason.trim()) return;
    this.refundOrderService.refundOrder(
      this.selectedOrderId,
      this.refundReason.trim()
    );
    this.showRefundForm = false;
    this.refundReason = '';
    this.selectedOrderId = null;
  }

  // Shipping Progress
  order = { shippingStatus: 'OutForDelivery' };

  shippingSteps = [
    'NotShipped',
    'ReadyToShip',
    'Shipped',
    'OutForDelivery',
    'Delivered',
  ];

  getCurrentStep(): number {
    return this.shippingSteps.indexOf(this.order.shippingStatus);
  }

  getStepLabel(step: string): string {
    switch (step) {
      case 'NotShipped':
        return 'Not Shipped';
      case 'ReadyToShip':
        return 'Ready To Ship';
      case 'Shipped':
        return 'Shipped';
      case 'OutForDelivery':
        return 'Out For Delivery';
      case 'Delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  }
}
