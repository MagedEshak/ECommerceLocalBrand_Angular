// ✅ login.component.ts
import { Component, Optional, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import { CartItemService } from '../../shared/services/cart/cart.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './../../shared/services/Auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ICartItem } from '../../models/ICartItem';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form!: FormGroup;
  isVerificationPopupVisible = false;
  verificationCode = '';
  countdown = 120;
  countdownDisplay = '02:00';
  private timer: any = null;

  @Output() loginSuccess = new EventEmitter<void>();

  constructor(
    public routerState: RouterStateService,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    @Optional() private dialogRef: MatDialogRef<Login>,
    private router: Router,
    private _authService: AuthService,
    private _cartItemService: CartItemService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  sendCode() {
    const email = this.form.get('email')?.value;

    if (this.form.invalid) {
      alert('Please enter a valid email.');
      return;
    }

    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();
        this.isVerificationPopupVisible = true;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send verification code.');
      },
    });
  }

  startCountdown() {
    this.countdown = 120;
    this.updateCountdownDisplay();
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.countdown--;
      this.updateCountdownDisplay();

      if (this.countdown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.countdownDisplay = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  resendCode() {
    if (this.countdown > 0) return;

    const email = this.form.get('email')?.value;
    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();
      },
      error: () => alert('Failed to resend code.'),
    });
  }

  async verifyCode() {
    const email = this.form.get('email')?.value;
    const code = this.verificationCode;

    this._loginService.loginAfterGetCode(email, code).subscribe({
      next: async (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Verification Successful',
          text: '✅ You have been logged in successfully!',
          timer: 2000,
          showConfirmButton: false,
        });

        // ✅ خزّن التوكن
        this._authService.setLogin(res.token);

        // ✅ ترحيل الجست كارت دفعة واحدة
        const guestCartRaw = localStorage.getItem('guestCart');
        if (guestCartRaw) {
          try {
            const cart = await firstValueFrom(this._cartItemService.getCurrentUserCart());
            const cartId = cart?.id;

            // ✅ جهّز الـ Payload النهائي بشكل صحيح
            const guestCartItems: ICartItem[] = JSON.parse(guestCartRaw).map((item: any) => ({
              id: 0,
              productId: item.productId,
              productSizeId: item.productSizeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPriceForOneItemType: item.totalPriceForOneItemType,
              productName: item.productName || item.name || 'Unknown',
              productImageUrl: item.productImageUrl || item.image || '',
              productSizeName: item.productSizeName || '',
            }));

            console.log('📦 Payload to /add-multiple:', guestCartItems);

            const result = await firstValueFrom(
              this._cartItemService.addToCartFromLocalStorageAfterLogin(guestCartItems)
            );

            console.log('✅ API Response from /add-multiple:', result);

            localStorage.removeItem('guestCart'); // ✅ تنظيف الجست كارت بعد النجاح
          } catch (err) {
            console.error('❌ Failed to sync guest cart to DB:', err);
            localStorage.removeItem('guestCart'); // حتى لو حصل خطأ
          }
        }

        // ✅ قفل الديالوج لو معمول Dialog
        if (this.dialogRef) {
          this.dialogRef.close({
            token: res.token,
            customerInfo: res.customerInfo,
          });
        }

        // ✅ Emit للي فتح الكومبوننت
        this.loginSuccess.emit();

        // ✅ تنقل للصفحة الرئيسية
        this.isVerificationPopupVisible = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Code',
          text: '❌ Please enter the correct verification code.',
        });
      },
    });
  }

  get isHome(): boolean {
    return this.routerState.isHome;
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
// 
