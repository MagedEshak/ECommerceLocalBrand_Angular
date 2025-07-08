
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  form!: FormGroup;

  constructor(
    public routerState: RouterStateService,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService, // ✅
    private router: Router) {

    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required]]
    });
  }


  isVerificationPopupVisible = false;
  verificationCode = '';
  countdown = 120;
  private timer: any = null;

  sendCode() {
    const email = this.form.get('email')?.value;

    if (this.form.invalid) {
      alert('Please enter a valid email.');
      return;
    }

    this._loginService.getVerifyingCodeToLogin(email).subscribe({
      next: () => {
        this.startCountdown();  // يبدأ العد التنازلي
        this.isVerificationPopupVisible = true;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send verification code.');
      }
    });
  }


  countdownDisplay = '02:00'; // 👈 إضافة متغير لعرض النص

  startCountdown() {
    this.countdown = 120;
    this.updateCountdownDisplay(); // أول تحديث
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.countdown--;

      this.updateCountdownDisplay(); // كل ثانية

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
      error: () => alert('Failed to resend code.')
    });
  }

  verifyCode() {
    const email = this.form.get('email')?.value;
    const code = this.verificationCode;

    this._loginService.loginAfterGetCode(email, code).subscribe({
      next: (res) => {
        alert('✅ Verification successful!');
        this.isVerificationPopupVisible = false;
        this.cookieService.set('authToken', res.token, 1); // 1 يوم صلاحية
        this.router.navigate(['/home']);
      },
      error: () => alert('❌ Invalid code.')
    });
  }




  get isHome(): boolean {
    return this.routerState.isHome;
  }
}
