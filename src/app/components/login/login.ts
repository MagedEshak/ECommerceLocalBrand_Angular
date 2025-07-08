import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterStateService } from '../../shared/services/Router-State/router-state.service';
import { LoginService } from '../../shared/services/login/login.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  form!: FormGroup;

  constructor(public routerState: RouterStateService, private _loginService: LoginService, private fb: FormBuilder) {

    this.form = this.fb.group({
      email: ['', [Validators.email, Validators.required]]
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
        alert('Verification code sent to your email.');
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send verification code.');
      }
    });
  }


  get isHome(): boolean {
    return this.routerState.isHome;
  }
}
