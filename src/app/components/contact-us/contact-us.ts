import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ContactUsService } from '../services/contact-us/contct-us.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs implements OnInit {
  contactForm!: FormGroup;

  isSubmitting = false;
  serverError: string | null = null;

  contactInfo = {
    email: 'info@company.com',
    phone: '+1 234 567 8900',
    address: 'Tahrir Street, Cairo, Egypt',
  };

  workingHours = [
    { days: 'Sunday - Thursday', hours: '9:00 AM - 6:00 PM' },
    { days: 'Friday', hours: '10:00 AM - 4:00 PM' },
    { days: 'Saturday', hours: 'Closed' },
  ];

  constructor(
    private _contactUsService: ContactUsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.serverError = null;
    this.isSubmitting = true;

    this._contactUsService
      .SendContactUsEmail(this.contactForm.value)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Your Message added successfully!',
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            background: '#166534',
            color: '#fff',
            customClass: { popup: 'custom-swal-toast' },
          });
          this.contactForm.reset();
        },
        error: (err) => {
          this.serverError =
            err?.error?.message || 'Failed to add Your Message!';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Faild to send Your Message!',
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            background: '#651616',
            color: '#fff',
            customClass: { popup: 'custom-swal-toast' },
          });
        },
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field?.errors) return '';
    if (field.errors['required']) return 'This field is required.';
    if (field.errors['email']) return 'Please enter a valid email address.';
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} characters required.`;
    }
    if (field.errors['pattern']) return 'Please enter a valid value.';
    return '';
  }
}
