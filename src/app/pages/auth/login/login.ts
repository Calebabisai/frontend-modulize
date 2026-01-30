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

  // Signals para el estado reactivo
  isLoading = signal(false);
  showRegisterModal = signal(false);
  alert = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  loginForm = this.fb.nonNullable.group({
    email: ['admin@turing.com', [Validators.required, Validators.email]],
    pass: ['123456', [Validators.required]],
  });

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    pass: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Función maestra para notificaciones interactivas
  private triggerAlert(text: string, type: 'success' | 'error') {
    this.alert.set({ text, type });
    // El timeout debe ser mayor a la animación CSS para que se vea fluida
    setTimeout(() => this.alert.set(null), 4000);
  }

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
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/products']),
        error: (err) => {
          console.error('Error en el login:', err);
          this.triggerAlert('Credenciales incorrectas. Verifica tu correo y contraseña', 'error');
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
          // Reemplazamos el alert() por nuestro Toast pro
          this.triggerAlert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.', 'success');
          this.toggleModal();
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          this.triggerAlert('No se pudo crear la cuenta. ¿Quizás el correo ya existe?', 'error');
        },
      });
  }
}
