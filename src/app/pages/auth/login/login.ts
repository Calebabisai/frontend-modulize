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
  showRegisterModal = signal(false);

  // Formulario de Login
  loginForm = this.fb.nonNullable.group({
    email: ['admin@turing.com', [Validators.required, Validators.email]],
    pass: ['123456', [Validators.required]],
  });

  // Formulario de Registro (dentro del modal)
  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    pass: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleModal() {
    this.showRegisterModal.update((val) => !val);
    this.registerForm.reset();
  }

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
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error en el login:', err);
        },
      });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    const { name, email, pass } = this.registerForm.getRawValue();

    this.authService
      .register(name, email, pass)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          alert('¡Registro exitoso! Ya puedes iniciar sesión.');
          this.toggleModal(); // Cierra el modal al terminar
        },
        error: () => alert('Error al registrar. Verifica los datos.'),
      });
  }
}
