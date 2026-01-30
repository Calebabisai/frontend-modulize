import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

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
    const { email, pass } = this.loginForm.getRawValue();

    this.authService
      .login(email, pass)
      .pipe(
        // Esto asegura que el botón se reactive pase lo que pase
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => {
          console.log('Login exitoso, navegando...');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error en el login:', err);
          // Aquí podrías mostrar una alerta con tu color 'primary'
        },
      });
  }
}
