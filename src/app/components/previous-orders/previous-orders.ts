import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-previous-orders',
  imports: [RouterLink, CommonModule],
  templateUrl: './previous-orders.html',
  styleUrl: './previous-orders.css',
})
export class PreviousOrders {
  order = {
    shippingStatus: 'OutForDelivery', // جرب: NotShipped, ReadyToShip, Shipped, OutForDelivery, Delivered
  };

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
