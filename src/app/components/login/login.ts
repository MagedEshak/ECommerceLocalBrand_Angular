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
      this.showWarning('Please enter a valid email.');
      return;
    }
    this.showWarning('Waiting');
    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();
        this.isVerificationPopupVisible = true;
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to send verification code.');
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
      error: () => this.showError('Failed to resend code.'),
    });
  }

  verifyCode() {
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
            const cart = await firstValueFrom(
              this._cartItemService.getCurrentUserCart()
            );
            const cartId = cart?.id; // جيب الـ CartId الصح من الـ API

            const guestCartItems: ICartItem[] = JSON.parse(guestCartRaw).map(
              (item: any) => ({
                ...item,
                cartId: cartId,
                unitPrice: parseFloat(item.unitPrice.toString()), // تحويل صريح لـ string ثم عشري
                totalPriceForOneItemType: parseFloat(
                  item.totalPriceForOneItemType.toString()
                ),
              })
            );
            console.log('Modified Guest Cart Items:', guestCartItems); // Log الـ Payload

            // ✅ استخدم الفنكشن الجديدة
            const result = await firstValueFrom(
              this._cartItemService.addToCartFromLocalStorageAfterLogin(
                guestCartItems
              )
            );
            console.log('API Response:', result);

            // ✅ بعد الترحيل الناجح، امسح الجست كارت
            localStorage.removeItem('guestCart');
          } catch (err) {
            console.error('❌ Failed to sync guest cart to DB:', err);
            localStorage.removeItem('guestCart');
          }
        }

        // ✅ قفل الديالوج لو معمول Dialog
        if (this.dialogRef) {
          this.dialogRef.close('logged-in');
        }

        // ✅ Emit للي فتح الكومبوننت
        this.loginSuccess.emit();

        // ✅ اختياري: تنقل
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

  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000,
    });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }

  showWarning(message: string) {
    Swal.fire({
      icon: 'warning',
      title: message,
      confirmButtonText: 'Ok',
    });
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
