import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { inject } from '@angular/core';
import { AuthService } from '../../service/auth-service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  readonly errorMessage = signal('');
  readonly successMessage = signal('');



  // constructor(
  //   private fb: FormBuilder
  // ) {}

  constructor() {

    this.registerForm.valueChanges.subscribe(() => {

      this.errorMessage.set('');

      this.successMessage.set('');

    });

  }

  private fb = inject(FormBuilder);

  registerForm: FormGroup = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2)
    ]],

    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]],

    about: ['']
  });

  private authService = inject(AuthService);

  register(): void {

    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      return;
    }

    this.authService
      .register(
        this.registerForm.getRawValue()
      )
      .subscribe({

        next: (response) => {

          console.log('User Registered', response);

          this.successMessage.set(
            'Registration Successful'
          );

          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);

          this.registerForm.reset({
            name: '',
            email: '',
            password: '',
            about: ''
          });

        },

        error: (error) => {

          console.error(error);
          this.errorMessage.set(
            error?.error
          );

          setTimeout(() => {

            this.errorMessage.set('');

          }, 5000);

        }

      });

  }

}
