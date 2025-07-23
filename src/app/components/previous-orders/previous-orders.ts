import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RefundOrderService } from '../../shared/services/refund-order/refund-order.service';
import { PreviousOrder } from '../../shared/services/PreviousOrders/previous-orders';
import { IPreviousOrder } from '../../models/iprevious-order';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-previous-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './previous-orders.html',
  styleUrls: ['./previous-orders.css'],
})
export class PreviousOrders implements OnInit {
  orders: IPreviousOrder[] = [];
  // filteredOrders: IPreviousOrder[] = [];
  imagePath = `${environment.baseServerUrl}`;

  selectedOrderId: number | null = null;
  selectedProductId: number | null = null;
  refundReason: string = '';

  showRefundForm = false;
  showProductRefundForm = false;
  statusBar = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Rejected',
  ];
  filterOptions = ['All Orders', 'Completed', 'Cancelled', 'Pending'];
  selectedFilter = 'All Orders';
  constructor(
    private refundOrderService: RefundOrderService,
    private previousOrderService: PreviousOrder
  ) {}

  ngOnInit(): void {
    this.previousOrderService.getPreviousOrders().subscribe({
      next: (response) => {
        this.orders = response;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while fetching previous orders.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  // ===== Filtering

  // applyFilter() {
  //   if (!this.activeFilter) {
  //     this.filteredOrders = [...this.orders];
  //   } else {
  //     this.filteredOrders = this.orders.filter(
  //       (order) => order.shippingStatus === this.activeFilter
  //     );
  //   }
  // }
  // الدالة لتغيير الفلتر
  filterByStatus(status: string) {
    this.selectedFilter = status;
  }

  // دالة ترجمة التسمية في الزر
  getStepLabel(status: string): string {
    switch (status) {
      case 'All Orders':
        return 'All Orders';
      case 'Completed':
        return 'Completed';
      case 'Cancelled':
        return 'Cancelled';
      case 'Pending':
        return 'Pending';
      default:
        return status;
    }
  }

  // الطلبات المفلترة
  get filteredOrders() {
    if (this.selectedFilter === 'All') {
      return this.orders;
    } else if (this.selectedFilter === 'Completed') {
      return this.orders.filter(
        (order) => order.shippingStatus === 'Delivered'
      );
    } else if (this.selectedFilter === 'Cancelled') {
      return this.orders.filter(
        (order) => order.shippingStatus === 'Cancelled'
      );
    }
    return this.orders;
  }

  // ===== Refund Forms
  openRefundForm(orderId: number) {
    this.selectedOrderId = orderId;
    this.selectedProductId = null;
    this.refundReason = '';
    this.showRefundForm = true;
    this.showProductRefundForm = false;
  }

  openProductRefundForm(orderId: number, productId: number) {
    this.selectedOrderId = orderId;
    this.selectedProductId = productId;
    this.refundReason = '';
    this.showProductRefundForm = true;
    this.showRefundForm = false;
  }

  closeRefundForms() {
    this.showRefundForm = false;
    this.showProductRefundForm = false;
    this.selectedOrderId = null;
    this.selectedProductId = null;
    this.refundReason = '';
  }

  // Submit Refund
  submitRefund(isProductRefund: boolean) {
    if (!this.refundReason.trim()) return;

    if (
      isProductRefund &&
      this.selectedOrderId &&
      this.selectedProductId !== null
    ) {
      this.refundOrderService
        .refundProduct(this.selectedProductId, this.refundReason.trim())
        .subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: '✅ Product refund request sent successfully.',
              icon: 'success',
              background: '#000',
              color: '#fff',
              confirmButtonColor: '#fff',
            });
            this.closeRefundForms();
          },
          error: (err) => {
            Swal.fire({
              title: 'Failed!',
              text:
                err?.error?.message ||
                '❌ Failed to send product refund request.',
              icon: 'error',
              background: '#000',
              color: '#fff',
              confirmButtonColor: '#fff',
            });
          },
        });
    } else if (!isProductRefund && this.selectedOrderId !== null) {
      this.refundOrderService
        .refundOrder(this.selectedOrderId, this.refundReason.trim())
        .subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: '✅ Order refund request sent successfully.',
              icon: 'success',
              background: '#000',
              color: '#fff',
              confirmButtonColor: '#fff',
            });
            this.closeRefundForms();
          },
          error: (err) => {
            Swal.fire({
              title: 'Failed!',
              text:
                err?.error?.message ||
                '❌ Failed to send order refund request.',
              icon: 'error',
              background: '#000',
              color: '#fff',
              confirmButtonColor: '#fff',
            });
          },
        });
    }
  }

  // Progress labels
}
