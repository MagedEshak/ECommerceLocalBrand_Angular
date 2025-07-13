import { AuthService } from './../../shared/services/Auth/auth.service';

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form!: FormGroup;
  isVerificationPopupVisible = false;
  verificationCode = '';
  countdown = 120;
  private timer: any = null;

  constructor(
    public routerState: RouterStateService,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private _authService: AuthService
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

  countdownDisplay = '02:00';

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
      next: (res) => {
        this.showSuccess(' Verification successful!');
        // alert(' Verification successful!');
        this.isVerificationPopupVisible = false;
        this._authService.setLogin(res.token);
        // this.cookieService.set('authToken', res.token, 1); // 1 يوم صلاحية
        this.router.navigate(['/home']);
      },
      error: () => this.showError('Invalid code.'),
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
}
