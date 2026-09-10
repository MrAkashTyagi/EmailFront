import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly loginForm = this.fb.nonNullable.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ]

  });

  login(): void {

    if (this.loginForm.invalid) {

      this.loginForm.markAllAsTouched();

      return;
    }

    this.loading.set(true);

    this.errorMessage.set('');

    this.authService
      .login(
        this.loginForm.getRawValue()
      )
      .subscribe({

        // next: (response: any) => {

        //   this.loading.set(false);

        //   localStorage.setItem(
        //     'user',
        //     JSON.stringify(response)
        //   );

        //   this.successMessage.set(
        //     'Login Successful'
        //   );

        //   this.router.navigate([
        //     '/dashboard'
        //   ]);

        // }
        next: (response: any) => {

          // localStorage.setItem(
          //   'user',
          //   JSON.stringify(response)
          // );

          this.authService.setUser(
            response
          );


          this.router.navigate([
            '/dashboard'
          ]);

        },

        error: (error) => {

          this.loading.set(false);

          this.errorMessage.set(
            error?.error ||
            'Login Failed'
          );

        }

      });

  }

}
