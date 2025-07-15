import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import Swal from 'sweetalert2';
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
import { AuthService } from './../../shared/services/Auth/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form!: FormGroup;

  constructor(
    public routerState: RouterStateService,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private _authService: AuthService,
    private dialogRef: MatDialogRef<Login> // ✅ بدل التنقل على الراوتر
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  isVerificationPopupVisible = false;
  verificationCode = '';
  countdown = 120;
  private timer: any = null;
  countdownDisplay = '02:00';

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

  verifyCode() {
    const email = this.form.get('email')?.value;
    const code = this.verificationCode;

    this._loginService.loginAfterGetCode(email, code).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Verification Successful',
          text: '✅ You have been logged in successfully!',
          timer: 2000,
          showConfirmButton: false,
        });

        this.isVerificationPopupVisible = false;
        this._authService.setLogin(res.token);

        // ✅ رجّع القيمة بدل التنقل
        this.dialogRef.close('logged-in');
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
}
