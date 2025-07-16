import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RefundOrderService {
  refundStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  refundMessage = signal<string | null>(null);

  constructor(private _httpClient: HttpClient) {}

  refundOrder(orderId: number, reason: string) {
    this.refundStatus.set('loading');
    this.refundMessage.set(null);

    return this._httpClient
      .post(`${environment.urlPath}payment/Request-order-refund`, {
        orderId,
        reason,
      })
      .subscribe({
        next: () => {
          this.refundStatus.set('success');
          this.refundMessage.set('✅ Refund request submitted successfully.');
        },
        error: (err) => {
          this.refundStatus.set('error');
          this.refundMessage.set(err?.error?.message || '❌ Refund failed.');
        },
      });
  }

  // ✅ دالة لإعادة تعيين الحالة
  resetRefundState() {
    this.refundStatus.set('idle');
    this.refundMessage.set(null);
  }
}
