import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para feedback visual
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['admin@turing.com', [Validators.required, Validators.email]], // Email del seed
    pass: ['123456', [Validators.required, Validators.minLength(6)]],
  });

  onLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, pass } = this.loginForm.getRawValue();

    this.authService.login(email, pass).subscribe({
      next: () => {
        this.router.navigate(['/products']); // Directo al dashboard profesional
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas, bro. Revisa el seed.');
      },
    });
  }
}
